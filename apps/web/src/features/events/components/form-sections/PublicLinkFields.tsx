import LinkIcon from "@mui/icons-material/Link";
import {
	Divider,
	Grid,
	InputAdornment,
	TextField,
	Typography,
} from "@mui/material";
import { useFormContext } from "react-hook-form";
import type { CreateEventInput } from "../../types";

export function PublicLinkFields({ disabled }: { disabled: boolean }) {
	const {
		register,
		formState: { errors },
	} = useFormContext<CreateEventInput>();

	return (
		<Grid container spacing={3} sx={{ width: "100%" }}>
			<Grid item xs={12}>
				<Typography
					variant="subtitle1"
					fontWeight={700}
					color="primary"
					sx={{ mt: 2 }}
				>
					Enlace Público
				</Typography>
				<Divider sx={{ my: 1 }} />
			</Grid>
			<Grid item xs={12}>
				<TextField
					fullWidth
					label="Slug (URL del evento) *"
					{...register("slug")}
					error={!!errors.slug}
					helperText={
						errors.slug?.message ??
						"El enlace final será: eventplanner.com/tu-slug"
					}
					disabled={disabled}
					InputProps={{
						startAdornment: (
							<InputAdornment position="start">
								<LinkIcon fontSize="small" sx={{ mr: 0.5 }} /> /
							</InputAdornment>
						),
					}}
				/>
			</Grid>
		</Grid>
	);
}
