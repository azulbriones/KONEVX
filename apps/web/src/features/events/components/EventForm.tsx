import { yupResolver } from "@hookform/resolvers/yup";
import {
	Box,
	Button,
	CircularProgress,
	Paper,
	Stack,
	Typography,
} from "@mui/material";
import { useEffect } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { CreateEventInput } from "../types";
import { schema } from "../utils/validationSchema";

import { GeneralInfoFields } from "./form-sections/GeneralInfoFields";
import { LocationTimeFields } from "./form-sections/LocationTimeFields";
import { MediaConfigFields } from "./form-sections/MediaConfigFields";
import { PublicLinkFields } from "./form-sections/PublicLinkFields";

interface EventFormProps {
	defaultValues?: Partial<CreateEventInput>;
	onSubmit: (data: CreateEventInput) => void;
	isPending: boolean;
	submitLabel: string;
	onCancel: () => void;
}

export function EventForm({
	defaultValues,
	onSubmit,
	isPending,
	submitLabel,
	onCancel,
}: EventFormProps) {
	const methods = useForm<CreateEventInput>({
		resolver: yupResolver(schema),
		defaultValues: {
			name: "",
			slug: "",
			capacity: 100,
			contactRequirement: "EMAIL",
			...defaultValues,
		},
	});

	useEffect(() => {
		if (defaultValues) {
			methods.reset(defaultValues);
		}
	}, [defaultValues, methods]);

	const title = defaultValues?.id ? "Editar" : "Crear";

	return (
		<Box
			sx={{
				display: "flex",
				justifyContent: "center",
				py: 4,
			}}
		>
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
				<Typography
					variant="h4"
					fontWeight={800}
					gutterBottom
					sx={{
						alignSelf: "flex-start",
						maxWidth: 900,
						mx: "auto",
						width: "100%",
						px: 2,
					}}
				>
					{`${title} evento`}
				</Typography>
				<FormProvider {...methods}>
					<Box
						sx={{ width: "100%" }}
						component="form"
						onSubmit={methods.handleSubmit(onSubmit)}
						noValidate
					>
						<Stack spacing={4} sx={{ width: "100%" }}>
							<GeneralInfoFields disabled={isPending} />
							<LocationTimeFields disabled={isPending} />
							<MediaConfigFields
								disabled={isPending}
								currentLogo={defaultValues?.logo}
							/>
							<PublicLinkFields disabled={isPending} />

							<Stack
								direction="row"
								spacing={2}
								justifyContent="flex-end"
								sx={{ mt: 2 }}
							>
								<Button
									variant="outlined"
									color="inherit"
									onClick={onCancel}
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
									{isPending ? "Procesando..." : submitLabel}
								</Button>
							</Stack>
						</Stack>
					</Box>
				</FormProvider>
			</Paper>
		</Box>
	);
}
