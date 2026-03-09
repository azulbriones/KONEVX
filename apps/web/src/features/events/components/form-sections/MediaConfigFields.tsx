import AlternateEmailIcon from "@mui/icons-material/AlternateEmail";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import ImageIcon from "@mui/icons-material/Image";
import TagIcon from "@mui/icons-material/Tag";
import VideoFileIcon from "@mui/icons-material/VideoFile";
import {
	Divider,
	Grid,
	InputAdornment,
	MenuItem,
	TextField,
	Typography,
} from "@mui/material";
import { useFormContext } from "react-hook-form";
import type { CreateEventInput } from "../../types";

export function MediaConfigFields({ disabled }: { disabled: boolean }) {
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
					sx={{ mt: 2 }}
				>
					Configuración y Multimedia
				</Typography>
				<Divider sx={{ my: 1 }} />
			</Grid>
			<Grid item xs={12} sm={6} md={3}>
				<TextField
					fullWidth
					label="Capacidad *"
					type="number"
					{...register("capacity")}
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
			<Grid item xs={12} sm={6} md={3}>
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
			<Grid item xs={12} sm={6} md={3}>
				<TextField
					fullWidth
					select
					label="Contacto requerido *"
					defaultValue="EMAIL"
					{...register("contactRequirement")}
					error={!!errors.contactRequirement}
					helperText={errors.contactRequirement?.message}
					disabled={disabled}
				>
					<MenuItem value="EMAIL">Email</MenuItem>
					<MenuItem value="PHONE">Teléfono</MenuItem>
				</TextField>
			</Grid>
			<Grid item xs={12} sm={6}>
				<TextField
					fullWidth
					type="file"
					label="Logo del Evento"
					InputLabelProps={{ shrink: true }}
					inputProps={{ accept: "image/*" }}
					{...register("logo")}
					error={!!errors.logo}
					disabled={disabled}
					InputProps={{
						startAdornment: (
							<InputAdornment position="start">
								<ImageIcon fontSize="small" />
							</InputAdornment>
						),
					}}
				/>
			</Grid>
			<Grid item xs={12} sm={6}>
				<TextField
					fullWidth
					type="file"
					label="Video promocional (Opcional)"
					InputLabelProps={{ shrink: true }}
					inputProps={{ accept: "video/*" }}
					{...register("promotionalVideo")}
					error={!!errors.promotionalVideo}
					helperText={
						errors.promotionalVideo?.message ||
						"Formatos soportados: MP4, MOV, etc."
					}
					disabled={disabled}
					InputProps={{
						startAdornment: (
							<InputAdornment position="start">
								<VideoFileIcon fontSize="small" />
							</InputAdornment>
						),
					}}
				/>
			</Grid>
			<Grid item xs={12} sm={6}>
				<TextField
					fullWidth
					type="file"
					label="Imágenes de promoción (Máx 3)"
					InputLabelProps={{ shrink: true }}
					inputProps={{ multiple: true, accept: "image/*" }}
					{...register("promotionalImages")}
					error={!!errors.promotionalImages}
					helperText={errors.promotionalImages?.message}
					disabled={disabled}
					InputProps={{
						startAdornment: (
							<InputAdornment position="start">
								<ImageIcon fontSize="small" />
							</InputAdornment>
						),
					}}
				/>
			</Grid>
			<Grid item xs={12} sm={6}>
				<TextField
					fullWidth
					label="Hashtag oficial"
					placeholder="#MiEvento2026"
					{...register("hashtag" as any)}
					error={!!(errors as any).hashtag}
					helperText={(errors as any).hashtag?.message as string}
					disabled={disabled}
					InputProps={{
						startAdornment: (
							<InputAdornment position="start">
								<TagIcon fontSize="small" />
							</InputAdornment>
						),
					}}
				/>
			</Grid>
			<Grid item xs={12} sm={6}>
				<TextField
					fullWidth
					multiline
					rows={2}
					label="Contactos de información"
					placeholder="Ej: +52 555 1234&#10;info@evento.com"
					{...register("contactInfo")}
					error={!!errors.contactInfo}
					helperText={
						errors.contactInfo?.message ||
						"Ingresa un contacto por línea."
					}
					disabled={disabled}
				/>
			</Grid>
			<Grid item xs={12} sm={6}>
				<TextField
					fullWidth
					multiline
					rows={2}
					label="Redes Sociales (Links)"
					placeholder="https://facebook.com/evento&#10;https://instagram.com/evento"
					{...register("socialMediaInfo")}
					error={!!errors.socialMediaInfo}
					helperText={
						errors.socialMediaInfo?.message ||
						"Pega un link de red social por línea."
					}
					disabled={disabled}
					InputProps={{
						startAdornment: (
							<InputAdornment position="start">
								<AlternateEmailIcon fontSize="small" />
							</InputAdornment>
						),
					}}
				/>
			</Grid>
		</Grid>
	);
}
