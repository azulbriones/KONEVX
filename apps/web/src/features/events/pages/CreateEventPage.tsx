import { useCreateEvent } from "@/features/events/hooks/useEvents";
import { getErrorMessage } from "@/features/utils/getErrorMessage";
import { yupResolver } from "@hookform/resolvers/yup";
import {
	Alert,
	Box,
	Button,
	CircularProgress,
	Paper,
	Stack,
	Typography,
} from "@mui/material";
import { FormProvider, useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { GeneralInfoFields } from "../components/form-sections/GeneralInfoFields";
import { LocationTimeFields } from "../components/form-sections/LocationTimeFields";
import { MediaConfigFields } from "../components/form-sections/MediaConfigFields";
import { PublicLinkFields } from "../components/form-sections/PublicLinkFields";
import type { CreateEventInput } from "../types";
import { schema } from "../utils/validationSchema";

export function CreateEventPage() {
	const navigate = useNavigate();
	const createMutation = useCreateEvent();

	const methods = useForm<CreateEventInput>({
		resolver: yupResolver(schema),
		defaultValues: {
			name: "",
			slug: "",
			capacity: 100,
			contactRequirement: "EMAIL",
		},
	});

	const onSubmit = (values: any) => {
		const formData = new FormData();
		console.log({ values });

		Object.keys(values).forEach((key) => {
			if (key !== "promotionalVideo" && key !== "promotionalImages") {
				if (
					values[key] !== undefined &&
					values[key] !== null &&
					values[key] !== ""
				) {
					formData.append(key, values[key]);
				}
			}
		});
		console.log({ values });

		if (values.promotionalVideo && values.promotionalVideo.length > 0) {
			formData.append("promotionalVideo", values.promotionalVideo[0]);
		}

		if (values.promotionalImages && values.promotionalImages.length > 0) {
			Array.from(values.promotionalImages).forEach((file: any) => {
				formData.append("promotionalImages", file);
			});
		}

		if (values.logo && values.logo.length > 0) {
			formData.append("logo", values.logo[0]);
		}

		console.log({ formData });
		createMutation.mutate(formData as any, {
			onSuccess: (created) => {
				navigate(`/events/${created.id}`, { replace: true });
			},
		});
	};
	const isPending = createMutation.isPending;

	return (
		<Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
			<Paper
				sx={{
					width: "100%",
					maxWidth: 900,
					p: { xs: 3, md: 5 },
					borderRadius: 3,
					boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
				}}
				variant="outlined"
			>
				<Stack spacing={3}>
					<Box>
						<Typography variant="h4" fontWeight={800} gutterBottom>
							Crear nuevo evento
						</Typography>
						<Typography variant="body1" color="text.secondary">
							Completa los detalles a continuación para configurar
							tu evento. Podrás editar esto más tarde.
						</Typography>
					</Box>

					{createMutation.isError && (
						<Alert severity="error" sx={{ borderRadius: 2 }}>
							{getErrorMessage(createMutation.error)}
						</Alert>
					)}

					<FormProvider {...methods}>
						<Box
							component="form"
							onSubmit={methods.handleSubmit(onSubmit)}
							noValidate
						>
							<GeneralInfoFields disabled={isPending} />
							<LocationTimeFields disabled={isPending} />
							<MediaConfigFields disabled={isPending} />
							<PublicLinkFields disabled={isPending} />

							<Stack
								direction="row"
								spacing={2}
								justifyContent="flex-end"
								sx={{ mt: 5 }}
							>
								<Button
									variant="outlined"
									color="inherit"
									onClick={() => navigate("/")}
									disabled={isPending}
									sx={{ borderRadius: 2 }}
								>
									Cancelar
								</Button>
								<Button
									type="submit"
									variant="contained"
									disabled={isPending}
									sx={{ borderRadius: 2, px: 4 }}
									startIcon={
										isPending ? (
											<CircularProgress
												size={18}
												color="inherit"
											/>
										) : null
									}
								>
									{isPending ? "Creando..." : "Crear Evento"}
								</Button>
							</Stack>
						</Box>
					</FormProvider>
				</Stack>
			</Paper>
		</Box>
	);
}
