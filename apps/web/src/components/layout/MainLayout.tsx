import { useLogout, useUser } from "@/features/auth/hooks/useAuth";
import {
	Dashboard as DashboardIcon,
	Logout as LogoutIcon,
	Person as PersonIcon,
} from "@mui/icons-material";
import {
	AppBar,
	Avatar,
	Box,
	Button,
	CircularProgress,
	Container,
	Divider,
	IconButton,
	ListItemIcon,
	Menu,
	MenuItem,
	Stack,
	Toolbar,
	Typography,
} from "@mui/material";
import { MouseEvent, useState } from "react";
import { Outlet, Link as RouterLink, useLocation } from "react-router-dom";

const NAV_LINKS = [
	{
		label: "Mis Eventos",
		path: "/",
		icon: <DashboardIcon sx={{ mr: 1, fontSize: 20 }} />,
	},
];

export function MainLayout() {
	const { data: user, isLoading } = useUser();
	const logoutMutation = useLogout();
	const location = useLocation();

	const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
	const open = Boolean(anchorEl);

	const handleMenuOpen = (event: MouseEvent<HTMLElement>) =>
		setAnchorEl(event.currentTarget);
	const handleMenuClose = () => setAnchorEl(null);

	const handleLogout = () => {
		handleMenuClose();
		logoutMutation.mutate();
	};

	const userInitials = user?.email?.charAt(0).toUpperCase() || "U";

	return (
		<Box
			sx={{
				minHeight: "100vh",
				bgcolor: "background.default",
				display: "flex",
				flexDirection: "column",
			}}
		>
			<AppBar
				position="sticky"
				elevation={0}
				color="inherit"
				sx={{
					borderBottom: "1px solid",
					borderColor: "divider",
					bgcolor: "background.paper",
				}}
			>
				<Container maxWidth="lg">
					<Toolbar disableGutters sx={{ height: 64 }}>
						<RouterLink
							to="/"
							style={{
								textDecoration: "none",
								color: "inherit",
								display: "flex",
								alignItems: "center",
							}}
						>
							<Typography
								variant="h6"
								fontWeight={800}
								color="primary"
								sx={{ mr: 4 }}
							>
								EventPlanner
							</Typography>
						</RouterLink>

						<Box
							sx={{
								flexGrow: 1,
								display: "flex",
								alignItems: "center",
								gap: 1,
							}}
						>
							{NAV_LINKS.map((link) => {
								const isActive =
									location.pathname === link.path;
								return (
									<Button
										key={link.path}
										component={RouterLink}
										to={link.path}
										color={isActive ? "primary" : "inherit"}
										sx={{
											textTransform: "none",
											fontWeight: isActive ? 700 : 500,
											color: isActive
												? "primary.main"
												: "text.secondary",
										}}
										startIcon={link.icon}
									>
										{link.label}
									</Button>
								);
							})}
						</Box>

						{isLoading ? (
							<CircularProgress size={24} />
						) : user ? (
							<>
								<Stack
									direction="row"
									alignItems="center"
									spacing={1}
									sx={{
										mr: 1,
										display: { xs: "none", sm: "flex" },
									}}
								>
									<Box textAlign="right">
										<Typography
											variant="subtitle2"
											lineHeight={1.2}
										>
											{user.firstName ||
												user.email.split("@")[0]}
										</Typography>
										<Typography
											variant="caption"
											color="text.secondary"
										>
											{user.role}
										</Typography>
									</Box>
								</Stack>

								<IconButton
									onClick={handleMenuOpen}
									size="small"
									aria-controls={
										open ? "account-menu" : undefined
									}
									aria-haspopup="true"
									aria-expanded={open ? "true" : undefined}
								>
									<Avatar
										sx={{
											width: 36,
											height: 36,
											bgcolor: "primary.main",
											fontSize: 16,
											fontWeight: "bold",
										}}
									>
										{userInitials}
									</Avatar>
								</IconButton>
							</>
						) : null}
					</Toolbar>
				</Container>
			</AppBar>

			<Menu
				anchorEl={anchorEl}
				id="account-menu"
				open={open}
				onClose={handleMenuClose}
				onClick={handleMenuClose}
				transformOrigin={{ horizontal: "right", vertical: "top" }}
				anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
				PaperProps={{
					elevation: 2,
					sx: { width: 200, mt: 1.5, borderRadius: 2 },
				}}
			>
				<MenuItem disabled>
					<ListItemIcon>
						<PersonIcon fontSize="small" />
					</ListItemIcon>
					Mi Perfil
				</MenuItem>
				<Divider />
				<MenuItem onClick={handleLogout} sx={{ color: "error.main" }}>
					<ListItemIcon>
						<LogoutIcon fontSize="small" color="error" />
					</ListItemIcon>
					Cerrar Sesión
				</MenuItem>
			</Menu>

			<Container
				maxWidth="lg"
				component="main"
				sx={{ flexGrow: 1, py: 4 }}
			>
				<Outlet />
			</Container>
		</Box>
	);
}
