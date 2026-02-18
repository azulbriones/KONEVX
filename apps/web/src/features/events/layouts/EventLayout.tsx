import { useEvent, useSetPublish } from "@/features/events/hooks/useEvents";
import { getErrorMessage } from "@/features/utils/getErrorMessage";
import {
	Box,
	Button,
	Chip,
	CircularProgress,
	Container,
	Paper,
	Stack,
	Tab,
	Tabs,
	Typography,
} from "@mui/material";
import {
	Outlet,
	Link as RouterLink,
	useLocation,
	useParams,
} from "react-router-dom";

const TABS = [
	{ label: "Resumen", path: "overview" },
	{ label: "Registros", path: "registrations" },
	{ label: "Campos", path: "fields" },
	// { label: "Miembros", path: "members" },
] as const;

export function EventLayout() {
	const { eventId } = useParams();
	const id = Number(eventId);
	const location = useLocation();

	const { data, isLoading, isError, error } = useEvent(id);
	const publishMutation = useSetPublish(id);

	const currentTab =
		TABS.find((t) => location.pathname.endsWith(t.path))?.path ||
		"overview";

	if (isLoading) {
		return (
			<Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
				<CircularProgress />
			</Box>
		);
	}

	if (isError) {
		return (
			<Container maxWidth="md" sx={{ py: 4 }}>
				<Typography color="error" variant="h6">
					{getErrorMessage(error)}
				</Typography>
				<Button component={RouterLink} to="/" sx={{ mt: 2 }}>
					Volver al Dashboard
				</Button>
			</Container>
		);
	}

	if (!data) return null;

	const { event, stats } = data;

	return (
		<Stack spacing={0}>
			<Paper
				elevation={0}
				sx={{
					borderBottom: 1,
					borderColor: "divider",
					pt: 3,
					px: { xs: 2, md: 4 },
					bgcolor: "background.paper",
				}}
			>
				<Stack spacing={3}>
					<Stack
						direction={{ xs: "column", sm: "row" }}
						justifyContent="space-between"
						alignItems={{ xs: "flex-start", sm: "center" }}
						spacing={2}
					>
						<Stack
							direction="row"
							alignItems="center"
							spacing={1.5}
						>
							<Typography variant="h4" fontWeight={800}>
								{event.name}
							</Typography>
							<Chip
								size="small"
								label={
									event.isPublished ? "Publicado" : "Borrador"
								}
								color={
									event.isPublished ? "success" : "default"
								}
								variant="outlined"
							/>
						</Stack>

						<Button
							variant={
								event.isPublished ? "outlined" : "contained"
							}
							color={event.isPublished ? "warning" : "primary"}
							onClick={() =>
								publishMutation.mutate(!event.isPublished)
							}
							disabled={publishMutation.isPending}
						>
							{event.isPublished
								? "Pasar a borrador"
								: "Publicar evento"}
						</Button>
					</Stack>

					<Tabs
						value={currentTab}
						textColor="primary"
						indicatorColor="primary"
					>
						{TABS.map((tab) => (
							<Tab
								key={tab.path}
								label={tab.label}
								value={tab.path}
								component={RouterLink}
								to={tab.path}
								sx={{ textTransform: "none", fontWeight: 600 }}
							/>
						))}
					</Tabs>
				</Stack>
			</Paper>

			<Box sx={{ p: { xs: 2, md: 4 } }}>
				<Outlet context={{ event, stats }} />
			</Box>
		</Stack>
	);
}
