import AccessTimeIcon from "@mui/icons-material/AccessTime";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import PlaceIcon from "@mui/icons-material/Place";
import {
	Divider,
	Grid,
	InputAdornment,
	TextField,
	Typography,
} from "@mui/material";
import { Controller, useFormContext } from "react-hook-form";
import type { CreateEventInput } from "../../types";

const formatForDateInput = (val: any) => {
	if (!val) return "";
	if (typeof val === "string" && val.includes("T")) {
		return val.split("T")[0];
	}
	if (val instanceof Date) {
		return val.toISOString().split("T")[0];
	}
	return val;
};

export function LocationTimeFields({ disabled }: { disabled: boolean }) {
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
					sx={{ mt: 2 }}
				>
					Ubicación y Horarios
				</Typography>
				<Divider sx={{ my: 1 }} />
			</Grid>

			<Grid item xs={12}>
				<TextField
					fullWidth
					label="Lugar del evento *"
					{...register("location")}
					error={!!errors.location}
					helperText={errors.location?.message}
					disabled={disabled}
					InputProps={{
						startAdornment: (
							<InputAdornment position="start">
								<PlaceIcon fontSize="small" />
							</InputAdornment>
						),
					}}
				/>
			</Grid>

			<Grid item xs={12} sm={6}>
				<Controller
					name="startDate"
					control={control}
					render={({ field }) => (
						<TextField
							fullWidth
							type="date"
							label="Fecha de inicio"
							InputLabelProps={{ shrink: true }}
							{...field}
							value={formatForDateInput(field.value)}
							error={!!(errors as any).startDate}
							helperText={
								(errors as any).startDate?.message as string
							}
							disabled={disabled}
							InputProps={{
								startAdornment: (
									<InputAdornment position="start">
										<CalendarTodayIcon fontSize="small" />
									</InputAdornment>
								),
							}}
						/>
					)}
				/>
			</Grid>

			<Grid item xs={12} sm={6}>
				<Controller
					name="endDate"
					control={control}
					render={({ field }) => (
						<TextField
							fullWidth
							type="date"
							label="Fecha de cierre"
							InputLabelProps={{ shrink: true }}
							{...field}
							value={formatForDateInput(field.value)}
							error={!!(errors as any).endDate}
							helperText={
								(errors as any).endDate?.message as string
							}
							disabled={disabled}
							InputProps={{
								startAdornment: (
									<InputAdornment position="start">
										<CalendarTodayIcon fontSize="small" />
									</InputAdornment>
								),
							}}
						/>
					)}
				/>
			</Grid>

			<Grid item xs={12} sm={6}>
				<TextField
					fullWidth
					type="time"
					label="Hora de entrada"
					InputLabelProps={{ shrink: true }}
					{...register("entryTime")}
					error={!!errors.entryTime}
					helperText={errors.entryTime?.message}
					disabled={disabled}
					InputProps={{
						startAdornment: (
							<InputAdornment position="start">
								<AccessTimeIcon fontSize="small" />
							</InputAdornment>
						),
					}}
				/>
			</Grid>
			<Grid item xs={12} sm={6}>
				<TextField
					fullWidth
					type="time"
					label="Hora de cierre"
					InputLabelProps={{ shrink: true }}
					{...register("exitTime")}
					error={!!errors.exitTime}
					helperText={errors.exitTime?.message}
					disabled={disabled}
					InputProps={{
						startAdornment: (
							<InputAdornment position="start">
								<AccessTimeIcon fontSize="small" />
							</InputAdornment>
						),
					}}
				/>
			</Grid>
		</Grid>
	);
}
