import { Divider, Grid, TextField, Typography } from "@mui/material";
import { useFormContext } from "react-hook-form";
import { CreateEventInput } from "../../types";

export function GeneralInfoFields({ disabled }: { disabled: boolean }) {
	const {
		register,
		formState: { errors },
	} = useFormContext<CreateEventInput>();

	return (
		<Grid container spacing={3}>
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
