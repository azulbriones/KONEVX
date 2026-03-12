import { yupResolver } from "@hookform/resolvers/yup";
import {
	Box,
	Button,
	Checkbox,
	Divider,
	Drawer,
	FormControl,
	FormControlLabel,
	FormHelperText,
	InputLabel,
	MenuItem,
	Select,
	Stack,
	TextField,
	Typography,
} from "@mui/material";
import { useEffect, useMemo } from "react";
import { Controller, useForm } from "react-hook-form";
import * as yup from "yup";
import type { EventField, FieldType } from "../../types";
import {
	isDuplicateKey,
	isSelectType,
	isValidSnakeCaseKey,
	optionsToText,
	toOptionsArray,
} from "../utils/fields";

type Mode = "create" | "edit";

export type FieldDrawerResult = {
	key: string;
	label: string;
	type: FieldType;
	required: boolean;
	options?: string[];
};

type Props = {
	open: boolean;
	mode: Mode;
	fields: EventField[];
	initial?: EventField | null;
	onClose: () => void;
	onSubmit: (values: FieldDrawerResult) => void;
};

type FormValues = {
	key: string;
	label: string;
	type: FieldType;
	required: boolean;
	optionsText: string;
};

export function FieldDrawer({
	open,
	mode,
	fields,
	initial,
	onClose,
	onSubmit,
}: Props) {
	const schema = useMemo(() => {
		return yup.object({
			key: yup
				.string()
				.required("El Key es requerido")
				.max(80)
				.test(
					"snake",
					"El Key debe ser snake_case (ej: mi_campo)",
					(v) => (v ? isValidSnakeCaseKey(v) : true),
				)
				.test("dup", "Este Key ya existe", (v) => {
					if (!v) return true;
					return !isDuplicateKey(fields, v, initial?.id);
				}),
			label: yup.string().required("El Label es requerido").max(200),
			type: yup
				.mixed<FieldType>()
				.oneOf([
					"TEXT",
					"TEXTAREA",
					"NUMBER",
					"DATE",
					"SELECT",
					"MULTI_SELECT",
					"CHECKBOX",
				])
				.required("Selecciona un tipo de dato"),
			required: yup.boolean().required(),
			optionsText: yup.string().when("type", ([type], schema) => {
				return isSelectType(type as FieldType)
					? schema.test(
							"has-options",
							"Debes agregar al menos una opción",
							(v) => toOptionsArray(v || "").length > 0,
						)
					: schema;
			}),
		});
	}, [fields, initial?.id]);

	const {
		register,
		handleSubmit,
		control,
		watch,
		reset,
		formState: { errors },
	} = useForm<FormValues>({
		resolver: yupResolver(schema) as any,
		defaultValues: {
			key: "",
			label: "",
			type: "TEXT",
			required: false,
			optionsText: "",
		},
	});

	useEffect(() => {
		if (open) {
			if (mode === "edit" && initial) {
				reset({
					key: initial.key,
					label: initial.label,
					type: initial.type,
					required: initial.required,
					optionsText: optionsToText(initial.options),
				});
			} else {
				reset({
					key: "",
					label: "",
					type: "TEXT",
					required: false,
					optionsText: "",
				});
			}
		}
	}, [open, mode, initial, reset]);

	const watchedType = watch("type");
	const showOptions = isSelectType(watchedType);

	const onFormSubmit = (values: FormValues) => {
		const isSelect = isSelectType(values.type);

		onSubmit({
			key: values.key.trim(),
			label: values.label.trim(),
			type: values.type,
			required: values.required,
			...(isSelect
				? { options: toOptionsArray(values.optionsText) }
				: {}),
		});
	};

	return (
		<Drawer
			anchor="right"
			open={open}
			onClose={onClose}
			PaperProps={{
				sx: { width: { xs: "100%", sm: 450 } },
			}}
		>
			<Box
				component="form"
				onSubmit={handleSubmit((values) =>
					onFormSubmit(values as FormValues),
				)}
				sx={{
					display: "flex",
					flexDirection: "column",
					height: "100%",
				}}
			>
				<Box sx={{ p: 3, pb: 2 }}>
					<Typography variant="h6" fontWeight={800}>
						{mode === "create"
							? "Nuevo Campo Personalizado"
							: "Editar Campo"}
					</Typography>
					<Typography variant="body2" color="text.secondary">
						Define la información que los usuarios deberán
						proporcionar.
					</Typography>
				</Box>

				<Divider />

				<Box sx={{ p: 3, flexGrow: 1, overflowY: "auto" }}>
					<Stack spacing={4}>
						<Box>
							<Typography
								variant="subtitle2"
								gutterBottom
								fontWeight={600}
							>
								Configuración Básica
							</Typography>
							<Stack spacing={2.5}>
								<TextField
									label="Etiqueta visible (Label)"
									placeholder="Ej: Enfermedad o Alergias"
									{...register("label")}
									error={!!errors.label}
									helperText={
										errors.label?.message ||
										"Así es como lo verá el usuario final."
									}
									fullWidth
								/>

								<TextField
									label="Identificador interno (Key)"
									placeholder="ej: enfermedades_alergias"
									{...register("key")}
									error={!!errors.key}
									helperText={
										errors.key?.message ||
										"Usado para exportar datos. Debe usar guiones bajos y minúsculas."
									}
									disabled={mode === "edit"}
									fullWidth
								/>
							</Stack>
						</Box>

						<Divider />

						<Box>
							<Typography
								variant="subtitle2"
								gutterBottom
								fontWeight={600}
							>
								Tipo de Respuesta
							</Typography>

							<Controller
								name="type"
								control={control}
								render={({ field }) => (
									<FormControl
										fullWidth
										error={!!errors.type}
										sx={{ mt: 1 }}
									>
										<InputLabel id="field-type-label">
											Selecciona el tipo de dato
										</InputLabel>
										<Select
											{...field}
											labelId="field-type-label"
											label="Selecciona el tipo de dato"
										>
											<MenuItem value="TEXT">
												Texto Corto (Ej: Nombre,
												Teléfono)
											</MenuItem>
											<MenuItem value="TEXTAREA">
												Texto Largo (Ej: Observaciones)
											</MenuItem>
											<MenuItem value="NUMBER">
												Número (Ej: Edad)
											</MenuItem>
											<MenuItem value="DATE">
												Fecha (Ej: Fecha de nacimiento)
											</MenuItem>
											<MenuItem value="SELECT">
												Menú Desplegable (Una sola
												opción)
											</MenuItem>
											<MenuItem value="MULTI_SELECT">
												Selección Múltiple (Varias
												opciones)
											</MenuItem>
											<MenuItem value="CHECKBOX">
												Casilla de verificación (Sí/No)
											</MenuItem>
										</Select>
										{errors.type && (
											<FormHelperText>
												{errors.type.message}
											</FormHelperText>
										)}
									</FormControl>
								)}
							/>

							{showOptions && (
								<TextField
									label="Opciones disponibles"
									placeholder={
										"Masculino\nFemenino\nPrefiero no decirlo"
									}
									multiline
									minRows={4}
									{...register("optionsText")}
									error={!!errors.optionsText}
									helperText={
										errors.optionsText?.message ||
										"Escribe una opción por línea y presiona Enter."
									}
									fullWidth
									sx={{ mt: 3 }}
								/>
							)}
						</Box>

						<Box
							sx={{
								bgcolor: "background.default",
								p: 2,
								borderRadius: 2,
							}}
						>
							<Controller
								name="required"
								control={control}
								render={({ field }) => (
									<FormControlLabel
										control={
											<Checkbox
												checked={field.value}
												onChange={field.onChange}
												color="primary"
											/>
										}
										label={
											<Box>
												<Typography
													variant="body2"
													fontWeight={600}
												>
													Hacer este campo obligatorio
												</Typography>
												<Typography
													variant="caption"
													color="text.secondary"
												>
													El usuario no podrá
													registrarse sin llenar este
													dato.
												</Typography>
											</Box>
										}
									/>
								)}
							/>
						</Box>
					</Stack>
				</Box>

				<Divider />

				<Box sx={{ p: 3, bgcolor: "background.paper" }}>
					<Stack direction="row" justifyContent="flex-end" gap={2}>
						<Button onClick={onClose} color="inherit" size="large">
							Cancelar
						</Button>
						<Button type="submit" variant="contained" size="large">
							{mode === "create"
								? "Agregar Campo"
								: "Guardar Cambios"}
						</Button>
					</Stack>
				</Box>
			</Box>
		</Drawer>
	);
}
