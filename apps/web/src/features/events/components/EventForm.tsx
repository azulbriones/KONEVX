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
import { GroupingSettingsFields } from "./form-sections/GroupingSettingsFields";
import { LocationTimeFields } from "./form-sections/LocationTimeFields";
import { MediaConfigFields } from "./form-sections/MediaConfigFields";
import { PublicLinkFields } from "./form-sections/PublicLinkFields";

// Función de utilidad para convertir nulls a undefined
// Esto evita errores de TypeScript cuando la API devuelve nulls
const sanitizeData = (data: any) => {
	if (!data) return data;
	const clean: any = { ...data };
	Object.keys(clean).forEach((key) => {
		if (clean[key] === null) {
			clean[key] = undefined;
		}
	});
	return clean;
};

interface EventFormProps {
	// Aceptamos 'any' aquí temporalmente o un tipo que permita nulls
	// para que el componente padre no de error al pasar data de la API
	defaultValues?: any;
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
		resolver: yupResolver(schema) as any,
		defaultValues: {
			name: "",
			slug: "",
			capacity: 100,
			contactRequirement: "EMAIL",
			...sanitizeData(defaultValues),
		},
	});

	useEffect(() => {
		if (defaultValues) {
			methods.reset(sanitizeData(defaultValues));
		}
	}, [defaultValues, methods]);

	const isEdit = !!(defaultValues as any)?.id;
	const title = isEdit ? "Editar" : "Crear";

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
				<Typography variant="h4" fontWeight={800} gutterBottom px={2}>
					{`${title} evento`}
				</Typography>

				<FormProvider {...methods}>
					<Box
						component="form"
						onSubmit={methods.handleSubmit(onSubmit)}
						noValidate
						sx={{ width: "100%" }}
					>
						<Stack spacing={4}>
							<GeneralInfoFields disabled={isPending} />
							<LocationTimeFields disabled={isPending} />
							<MediaConfigFields disabled={isPending} />
							<PublicLinkFields disabled={isPending} />
							<GroupingSettingsFields disabled={isPending} />
							<Stack
								direction="row"
								spacing={2}
								justifyContent="flex-end"
							>
								<Button
									variant="outlined"
									color="inherit"
									onClick={onCancel}
									disabled={isPending}
								>
									Cancelar
								</Button>
								<Button
									type="submit"
									variant="contained"
									disabled={isPending}
									sx={{ px: 4 }}
									startIcon={
										isPending && (
											<CircularProgress
												size={18}
												color="inherit"
											/>
										)
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
