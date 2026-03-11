import konevxLogo from "@/assets/konevx.webp";
import { useLogout, useUser } from "@/features/auth/hooks/useAuth";
import { useEvent } from "@/features/events/hooks/useEvents";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import LogoutIcon from "@mui/icons-material/Logout";
import {
	AppBar,
	Avatar,
	Box,
	Chip,
	CircularProgress,
	Container,
	IconButton,
	Menu,
	MenuItem,
	Toolbar,
	Typography,
} from "@mui/material";
import { useState } from "react";
import { Outlet, matchPath, useLocation, useNavigate } from "react-router-dom";

export function MainLayout() {
	const { data: user, isLoading: isUserLoading } = useUser();
	const logoutMutation = useLogout();
	const location = useLocation();
	const navigate = useNavigate();

	const match = matchPath("/events/:eventId/*", location.pathname);
	const eventId = match?.params.eventId ? Number(match.params.eventId) : 0;

	const { data: eventData } = useEvent(eventId);
	const event = eventData?.event;

	const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
	const openMenu = Boolean(anchorEl);

	const handleMenuOpen = (e: React.MouseEvent<HTMLElement>) => {
		setAnchorEl(e.currentTarget);
	};

	const handleMenuClose = () => {
		setAnchorEl(null);
	};

	const handleLogout = () => {
		handleMenuClose();
		logoutMutation.mutate();
	};

	const userInitials = user?.email?.charAt(0).toUpperCase() || "U";
	const isHome = location.pathname === "/";

	return (
		<Box
			sx={{
				display: "flex",
				flexDirection: "column",
				minHeight: "100vh",
			}}
		>
			<AppBar
				position="sticky"
				elevation={0}
				sx={{
					bgcolor: "background.paper",
					color: "text.primary",
					borderBottom: "1px solid",
					borderColor: "divider",
				}}
			>
				<Toolbar
					sx={{ display: "flex", justifyContent: "space-between" }}
				>
					<Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
						{!isHome && (
							<IconButton
								edge="start"
								color="inherit"
								onClick={() => navigate(-1)}
								aria-label="Regresar"
								sx={{ mr: 1 }}
							>
								<ArrowBackIcon />
							</IconButton>
						)}

						<Box
							sx={{
								borderRadius: "12px",
								bgcolor: "#9d9eac",
								display: "flex",
								alignItems: "center",
								justifyContent: "center",
								boxShadow: "0 2px 8px rgba(15, 23, 42, 0.15)",
								p: "5px 10px",
								cursor: "pointer",
							}}
							onClick={() => navigate("/")}
						>
							<Box
								component="img"
								src={konevxLogo}
								alt="Konevx Logo"
								sx={{
									width: 32,
									height: 32,
									objectFit: "contain",
									borderRadius: "4px",
								}}
							/>
							<Typography
								variant="h6"
								fontWeight="900"
								sx={{
									letterSpacing: "-1px",
									color: "inherit",
									display: { xs: "none", sm: "block" },
								}}
							>
								Konevx
							</Typography>
						</Box>

						{event && (
							<Box
								sx={{
									display: { xs: "none", md: "flex" },
									alignItems: "center",
								}}
							>
								<ChevronRightIcon
									sx={{ mx: 0.5, color: "text.disabled" }}
								/>
								<Typography
									variant="subtitle1"
									fontWeight="600"
									sx={{
										maxWidth: { sm: 150, md: 250 },
										whiteSpace: "nowrap",
										overflow: "hidden",
										textOverflow: "ellipsis",
									}}
								>
									{event.name}
								</Typography>
								<Chip
									label={
										event.isPublished
											? "Publicado"
											: "Borrador"
									}
									size="small"
									color={
										event.isPublished
											? "success"
											: "default"
									}
									sx={{
										ml: 1.5,
										height: 22,
										fontSize: "0.7rem",
										fontWeight: "bold",
									}}
								/>
							</Box>
						)}
					</Box>

					<Box>
						{isUserLoading ? (
							<CircularProgress size={24} />
						) : user ? (
							<>
								<IconButton
									onClick={handleMenuOpen}
									size="small"
									sx={{ p: 0 }}
								>
									<Avatar
										sx={{
											width: 40,
											height: 40,
											bgcolor: "var(--orange)",
											fontSize: 16,
											fontWeight: "bold",
											transition: "transform 0.2s",
											"&:hover": {
												transform: "scale(1.05)",
											},
										}}
									>
										{userInitials}
									</Avatar>
								</IconButton>

								<Menu
									anchorEl={anchorEl}
									open={openMenu}
									onClose={handleMenuClose}
									onClick={handleMenuClose}
									transformOrigin={{
										horizontal: "right",
										vertical: "top",
									}}
									anchorOrigin={{
										horizontal: "right",
										vertical: "bottom",
									}}
									PaperProps={{
										elevation: 4,
										sx: {
											mt: 1.5,
											minWidth: 180,
											borderRadius: 2,
										},
									}}
								>
									<MenuItem
										onClick={handleLogout}
										sx={{ gap: 1.5, py: 1.5 }}
									>
										<LogoutIcon fontSize="small" />
										Cerrar sesión
									</MenuItem>
								</Menu>
							</>
						) : null}
					</Box>
				</Toolbar>
			</AppBar>

			<Box
				component="main"
				sx={{ flexGrow: 1, p: { xs: 2, sm: 3, md: 4 } }}
			>
				<Container maxWidth="lg" sx={{ p: "0 !important" }}>
					<Outlet />
				</Container>
			</Box>
		</Box>
	);
}
