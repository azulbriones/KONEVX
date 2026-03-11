import { useEvent, useSetPublish } from "@/features/events/hooks/useEvents";
import { getErrorMessage } from "@/features/utils/getErrorMessage";
import {
	Box,
	Button,
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
	{ label: "Resumen", path: "overview", gate: (a: any) => a?.canRead },
	{ label: "Registros", path: "registrations", gate: (a: any) => a?.canRead },
	{ label: "Campos", path: "fields", gate: (a: any) => a?.canManageFields },
	{
		label: "Miembros",
		path: "members",
		gate: (a: any) => a?.canManageMembers,
	},
	{ label: "Ajustes", path: "edit", gate: (a: any) => a?.canWrite },
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

	const { event, stats, access } = data;

	return (
		<Stack spacing={0}>
			<Paper
				elevation={0}
				sx={{
					borderBottom: 1,
					borderColor: "divider",
					bgcolor: "transparent",
					px: 1,
				}}
			>
				<Stack
					direction="row"
					justifyContent="space-between"
					alignItems="flex-end"
					flexWrap="wrap-reverse"
					gap={2}
				>
					<Tabs
						value={currentTab}
						textColor="primary"
						indicatorColor="primary"
						variant="scrollable"
						scrollButtons="auto"
						sx={{ minHeight: 48 }}
					>
						{TABS.map((tab) => {
							const enabled = tab.gate(access);
							return (
								<Tab
									key={tab.path}
									label={tab.label}
									value={tab.path}
									component={RouterLink}
									to={tab.path}
									disabled={!enabled}
									sx={{
										textTransform: "none",
										fontWeight: 600,
										fontSize: "0.95rem",
										minWidth: 100,
									}}
								/>
							);
						})}
					</Tabs>

					<Box sx={{ pb: 1 }}>
						<Button
							variant={
								event.isPublished ? "outlined" : "contained"
							}
							color={event.isPublished ? "warning" : "primary"}
							onClick={() =>
								publishMutation.mutate(!event.isPublished)
							}
							disabled={
								publishMutation.isPending || !access.canWrite
							}
							size="small"
							sx={{ borderRadius: 2, fontWeight: 700 }}
						>
							{event.isPublished
								? "Pasar a borrador"
								: "Publicar evento"}
						</Button>
					</Box>
				</Stack>
			</Paper>

			<Box sx={{ py: 4 }}>
				<Outlet context={{ event, stats, access }} />
			</Box>
		</Stack>
	);
}
