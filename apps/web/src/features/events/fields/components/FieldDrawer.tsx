import { yupResolver } from "@hookform/resolvers/yup";
import {
	Box,
	Button,
	Checkbox,
	Drawer,
	FormControl,
	FormControlLabel,
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
					"NUMBER",
					"DATE",
					"SELECT",
					"MULTI_SELECT",
					"CHECKBOX",
				])
				.required(),
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
		resolver: yupResolver(schema),
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
		<Drawer anchor="right" open={open} onClose={onClose}>
			<Box
				component="form"
				onSubmit={handleSubmit(onFormSubmit)}
				sx={{ width: { xs: "100%", sm: 450 }, p: 3, mt: 4 }}
			>
				<Stack spacing={3}>
					<Typography variant="h6" fontWeight={800}>
						{mode === "create" ? "Nuevo Campo" : "Editar Campo"}
					</Typography>

					<TextField
						label="Key (Identificador)"
						placeholder="ej: fecha_nacimiento"
						{...register("key")}
						error={!!errors.key}
						helperText={errors.key?.message || "Usado internamente"}
						disabled={mode === "edit"}
						fullWidth
					/>

					<TextField
						label="Label (Etiqueta visible)"
						placeholder="ej: Fecha de Nacimiento"
						{...register("label")}
						error={!!errors.label}
						helperText={errors.label?.message}
						fullWidth
					/>

					<Controller
						name="type"
						control={control}
						render={({ field }) => (
							<FormControl fullWidth>
								<InputLabel>Tipo de dato</InputLabel>
								<Select {...field} label="Tipo de dato">
									<MenuItem value="TEXT">
										Texto Corto
									</MenuItem>
									<MenuItem value="NUMBER">Número</MenuItem>
									<MenuItem value="DATE">Fecha</MenuItem>
									<MenuItem value="CHECKBOX">
										Casilla (Sí/No)
									</MenuItem>
									<MenuItem value="SELECT">
										Selección Única
									</MenuItem>
									<MenuItem value="MULTI_SELECT">
										Selección Múltiple
									</MenuItem>
								</Select>
							</FormControl>
						)}
					/>

					<Controller
						name="required"
						control={control}
						render={({ field }) => (
							<FormControlLabel
								control={
									<Checkbox
										checked={field.value}
										onChange={field.onChange}
									/>
								}
								label="Este campo es obligatorio"
							/>
						)}
					/>

					{showOptions && (
						<TextField
							label="Opciones"
							placeholder={"Opción 1\nOpción 2\nOpción 3"}
							multiline
							minRows={4}
							{...register("optionsText")}
							error={!!errors.optionsText}
							helperText={
								errors.optionsText?.message ||
								"Escribe una opción por línea"
							}
							fullWidth
						/>
					)}

					<Stack
						direction="row"
						justifyContent="flex-end"
						gap={1}
						sx={{ mt: 2 }}
					>
						<Button onClick={onClose} color="inherit">
							Cancelar
						</Button>
						<Button type="submit" variant="contained">
							{mode === "create" ? "Agregar" : "Actualizar"}
						</Button>
					</Stack>
				</Stack>
			</Box>
		</Drawer>
	);
}
