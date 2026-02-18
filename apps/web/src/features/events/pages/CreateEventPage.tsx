import { useCreateEvent } from "@/features/events/hooks/useEvents";
import { getErrorMessage } from "@/features/utils/getErrorMessage";
import { yupResolver } from "@hookform/resolvers/yup";
import {
	Alert,
	Box,
	Button,
	CircularProgress,
	MenuItem,
	Paper,
	Stack,
	TextField,
	Typography,
} from "@mui/material";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import type { CreateEventInput } from "../types";
import { schema } from "../utils/validationSchema";

export function CreateEventPage() {
	const navigate = useNavigate();
	const createMutation = useCreateEvent();

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<CreateEventInput>({
		resolver: yupResolver(schema),
		defaultValues: {
			name: "",
			slug: "",
			capacity: 100,
			contactRequirement: "EMAIL",
		},
	});

	const onSubmit = (values: CreateEventInput) => {
		createMutation.mutate(values, {
			onSuccess: (created) => {
				navigate(`/events/${created.id}`, { replace: true });
			},
		});
	};

	return (
		<Box sx={{ display: "flex", justifyContent: "center" }}>
			<Paper
				sx={{ width: "100%", maxWidth: 720, p: 3, borderRadius: 3 }}
				variant="outlined"
			>
				<Stack spacing={2.5}>
					<Stack spacing={0.5}>
						<Typography variant="h5" fontWeight={800}>
							Crear evento
						</Typography>
						<Typography variant="body2" color="text.secondary">
							Define la configuración inicial del evento.
						</Typography>
					</Stack>

					{createMutation.isError && (
						<Alert severity="error">
							{getErrorMessage(createMutation.error)}
						</Alert>
					)}

					<Box
						component="form"
						onSubmit={handleSubmit(onSubmit)}
						noValidate
					>
						<Stack spacing={2}>
							<TextField
								label="Nombre"
								{...register("name")}
								error={!!errors.name}
								helperText={errors.name?.message}
								disabled={createMutation.isPending}
							/>

							<TextField
								label="Slug"
								{...register("slug")}
								error={!!errors.slug}
								helperText={
									errors.slug?.message ?? "Ej: my-event-2026"
								}
								disabled={createMutation.isPending}
							/>

							<TextField
								label="Capacidad"
								type="number"
								{...register("capacity")}
								error={!!errors.capacity}
								helperText={errors.capacity?.message}
								disabled={createMutation.isPending}
							/>

							<TextField
								label="Requisito de contacto"
								select
								defaultValue="EMAIL"
								{...register("contactRequirement")}
								error={!!errors.contactRequirement}
								helperText={errors.contactRequirement?.message}
								disabled={createMutation.isPending}
							>
								<MenuItem value="EMAIL">EMAIL</MenuItem>
								<MenuItem value="PHONE">PHONE</MenuItem>
							</TextField>

							<Stack
								direction="row"
								spacing={1}
								justifyContent="flex-end"
							>
								<Button
									variant="text"
									onClick={() => navigate("/")}
									disabled={createMutation.isPending}
								>
									Cancelar
								</Button>

								<Button
									type="submit"
									variant="contained"
									disabled={createMutation.isPending}
									startIcon={
										createMutation.isPending ? (
											<CircularProgress
												size={18}
												color="inherit"
											/>
										) : null
									}
								>
									Crear
								</Button>
							</Stack>
						</Stack>
					</Box>
				</Stack>
			</Paper>
		</Box>
	);
}
