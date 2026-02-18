import { BarChart, Description, People } from "@mui/icons-material";
import {
	Box,
	Card,
	CardContent,
	Divider,
	Grid,
	Stack,
	Typography,
} from "@mui/material";
import React from "react";
import { useOutletContext } from "react-router-dom";
import type { Ctx } from "../types";

export function EventOverviewPage() {
	const { event, stats } = useOutletContext<Ctx>();

	return (
		<Stack spacing={3}>
			<Grid container spacing={2}>
				<Grid item xs={12} sm={4}>
					<StatCard
						title="Registros"
						value={stats.registrationsCount}
						icon={<People color="primary" />}
					/>
				</Grid>
				<Grid item xs={12} sm={4}>
					<StatCard
						title="Ocupación"
						value={`${stats.occupancy ?? 0}%`}
						icon={<BarChart color="secondary" />}
					/>
				</Grid>
				<Grid item xs={12} sm={4}>
					<StatCard
						title="Campos Config."
						value={stats.fieldsCount}
						icon={<Description color="action" />}
					/>
				</Grid>
			</Grid>

			<Card variant="outlined">
				<CardContent>
					<Typography variant="h6" fontWeight={700} gutterBottom>
						Configuración
					</Typography>
					<Divider sx={{ mb: 2 }} />

					<Grid container spacing={2}>
						<Grid item xs={12} sm={6}>
							<Typography
								variant="subtitle2"
								color="text.secondary"
							>
								Slug (URL)
							</Typography>
							<Typography variant="body1" fontWeight={500}>
								{event.slug}
							</Typography>
						</Grid>

						<Grid item xs={6} sm={3}>
							<Typography
								variant="subtitle2"
								color="text.secondary"
							>
								Capacidad
							</Typography>
							<Typography variant="body1">
								{event.capacity} personas
							</Typography>
						</Grid>

						<Grid item xs={6} sm={3}>
							<Typography
								variant="subtitle2"
								color="text.secondary"
							>
								Requisito
							</Typography>
							<Typography variant="body1">
								{event.contactRequirement}
							</Typography>
						</Grid>
					</Grid>
				</CardContent>
			</Card>
		</Stack>
	);
}

function StatCard({
	title,
	value,
	icon,
}: {
	title: string;
	value: string | number;
	icon: React.ReactNode;
}) {
	return (
		<Card variant="outlined">
			<CardContent>
				<Stack direction="row" alignItems="center" spacing={2}>
					<Box
						sx={{
							p: 1.5,
							bgcolor: "background.default",
							borderRadius: 2,
						}}
					>
						{icon}
					</Box>
					<Box>
						<Typography
							variant="caption"
							color="text.secondary"
							fontWeight={600}
						>
							{title.toUpperCase()}
						</Typography>
						<Typography variant="h5" fontWeight={700}>
							{value}
						</Typography>
					</Box>
				</Stack>
			</CardContent>
		</Card>
	);
}
