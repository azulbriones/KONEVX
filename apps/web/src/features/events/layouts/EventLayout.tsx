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

export function EventLayout() {
	const { eventId } = useParams();
	const id = Number(eventId);
	const location = useLocation();

	const { data, isLoading, isError, error } = useEvent(id);
	const publishMutation = useSetPublish(id);

	if (!eventId || !Number.isFinite(id)) {
		return <Typography color="error">ID de evento inválido</Typography>;
	}

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

	const { event, stats, access } = data;

	const TABS = [
		{ label: "Resumen", path: "overview", show: true },
		{ label: "Registros", path: "registrations", show: access.canRead },
		{ label: "Campos", path: "fields", show: access.canManageFields },
		{ label: "Miembros", path: "members", show: access.canManageMembers },
	] as const;

	const visibleTabs = TABS.filter((t) => t.show);

	const currentTab =
		visibleTabs.find((t) => location.pathname.endsWith(t.path))?.path ||
		"overview";

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

						{access.canWrite && (
							<Button
								variant={
									event.isPublished ? "outlined" : "contained"
								}
								color={
									event.isPublished ? "warning" : "primary"
								}
								onClick={() =>
									publishMutation.mutate(!event.isPublished)
								}
								disabled={publishMutation.isPending}
							>
								{event.isPublished
									? "Pasar a borrador"
									: "Publicar evento"}
							</Button>
						)}
					</Stack>

					<Tabs
						value={currentTab}
						textColor="primary"
						indicatorColor="primary"
					>
						{visibleTabs.map((tab) => (
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

					{publishMutation.isError && (
						<Typography color="error">
							{getErrorMessage(publishMutation.error)}
						</Typography>
					)}

					<Typography variant="body2" color="text.secondary">
						slug: <b>{event.slug}</b> · capacidad:{" "}
						<b>{event.capacity}</b> · contacto:{" "}
						<b>{event.contactRequirement}</b> · fields:{" "}
						<b>{stats.fieldsCount}</b> · regs:{" "}
						<b>{stats.registrationsCount}</b>
					</Typography>
				</Stack>
			</Paper>

			<Box sx={{ p: { xs: 2, md: 4 } }}>
				<Outlet context={{ event, stats, access }} />
			</Box>
		</Stack>
	);
}
