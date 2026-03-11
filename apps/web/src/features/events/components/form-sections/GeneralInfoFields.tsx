import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import {
	Divider,
	Grid,
	InputAdornment,
	MenuItem,
	TextField,
	Typography,
} from "@mui/material";
import { Controller, useFormContext } from "react-hook-form";
import { CreateEventInput } from "../../types";

export function GeneralInfoFields({ disabled }: { disabled: boolean }) {
	const {
		register,
		control,
		formState: { errors },
	} = useFormContext<CreateEventInput>();

	return (
		<Grid container spacing={3} sx={{ width: "100%" }}>
			<Grid item xs={12}>
				<Typography
					variant="subtitle1"
					fontWeight={700}
					color="primary"
					sx={{ mt: 1 }}
				>
					Información General
				</Typography>
				<Divider sx={{ my: 1 }} />
			</Grid>

			<Grid item xs={12} sm={6}>
				<TextField
					fullWidth
					label="Nombre del evento *"
					{...register("name")}
					error={!!errors.name}
					helperText={errors.name?.message}
					disabled={disabled}
				/>
			</Grid>
			<Grid item xs={12} sm={6}>
				<TextField
					fullWidth
					label="Organizador *"
					{...register("organizerName")}
					error={!!errors.organizerName}
					helperText={errors.organizerName?.message}
					disabled={disabled}
				/>
			</Grid>

			<Grid item xs={12} sm={6} md={3}>
				<TextField
					fullWidth
					type="number"
					label="Capacidad (Asistentes) *"
					{...register("capacity", { valueAsNumber: true })}
					error={!!errors.capacity}
					helperText={errors.capacity?.message}
					disabled={disabled}
				/>
			</Grid>

			<Grid item xs={12} sm={6} md={3}>
				<TextField
					fullWidth
					label="Costo"
					type="number"
					{...register("cost")}
					error={!!errors.cost}
					helperText={errors.cost?.message}
					disabled={disabled}
					InputProps={{
						startAdornment: (
							<InputAdornment position="start">
								<AttachMoneyIcon fontSize="small" />
							</InputAdornment>
						),
					}}
				/>
			</Grid>
			<Grid item xs={12} sm={6} md={2.5}>
				<TextField
					fullWidth
					label="Edad mínima"
					type="number"
					{...register("minAge")}
					error={!!errors.minAge}
					helperText={errors.minAge?.message}
					disabled={disabled}
				/>
			</Grid>

			<Grid item xs={12} sm={6} md={3.5}>
				<Controller
					name="contactRequirement"
					control={control}
					render={({ field }) => {
						return (
							<TextField
								{...field}
								select
								fullWidth
								label="Requisito de Contacto *"
								disabled={disabled}
								error={!!errors.contactRequirement}
								helperText={
									errors.contactRequirement?.message as string
								}
							>
								<MenuItem value="EMAIL">
									Correo Electrónico
								</MenuItem>
								<MenuItem value="PHONE">
									Teléfono (WhatsApp)
								</MenuItem>
							</TextField>
						);
					}}
				/>
			</Grid>

			<Grid item xs={12}>
				<TextField
					fullWidth
					label="Slogan del evento"
					{...register("slogan")}
					error={!!errors.slogan}
					helperText={errors.slogan?.message}
					disabled={disabled}
				/>
			</Grid>
			<Grid item xs={12}>
				<TextField
					fullWidth
					multiline
					rows={3}
					label="Descripción del evento"
					{...register("description")}
					error={!!errors.description}
					helperText={errors.description?.message}
					disabled={disabled}
				/>
			</Grid>
			<Grid item xs={12}>
				<TextField
					fullWidth
					multiline
					rows={2}
					label="Descripción de pie de página (Footer)"
					{...register("footerDescription")}
					error={!!errors.footerDescription}
					helperText={errors.footerDescription?.message}
					disabled={disabled}
				/>
			</Grid>

			<Grid item xs={12}>
				<Typography
					variant="subtitle1"
					fontWeight={700}
					color="primary"
					sx={{ mt: 2 }}
				>
					Instrucciones para asistentes
				</Typography>
				<Divider sx={{ my: 1 }} />
			</Grid>

			<Grid item xs={12} sm={6}>
				<TextField
					fullWidth
					multiline
					rows={3}
					label="¿Qué deben llevar?"
					placeholder="Ej: Ropa cómoda, Biblia, libreta..."
					{...register("thingsToBring")}
					disabled={disabled}
				/>
			</Grid>
			<Grid item xs={12} sm={6}>
				<TextField
					fullWidth
					multiline
					rows={3}
					label="¿Qué NO deben llevar?"
					placeholder="Ej: Objetos punzocortantes, alcohol..."
					{...register("thingsNotToBring")}
					disabled={disabled}
				/>
			</Grid>
			<Grid item xs={12}>
				<TextField
					fullWidth
					multiline
					rows={2}
					label="Notas adicionales"
					placeholder="Cualquier otra indicación importante..."
					{...register("note")}
					disabled={disabled}
				/>
			</Grid>
		</Grid>
	);
}
