import AccessTimeIcon from "@mui/icons-material/AccessTime";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import PlaceIcon from "@mui/icons-material/Place";
import { Grid, InputAdornment, TextField } from "@mui/material";
import { Controller, useFormContext } from "react-hook-form";
import type { CreateEventInput } from "../../types";
import { EventFormSection } from "./EventFormSection";

import styles from "./formSections.module.css";

const formatForDateInput = (val: string | Date | null | undefined) => {
  if (!val) return "";
  if (typeof val === "string" && val.includes("T")) {
    return val.split("T")[0];
  }
  if (val instanceof Date) {
    return val.toISOString().split("T")[0];
  }
  return val;
};

type LocationTimeFieldsProps = {
  disabled: boolean;
};

export const LocationTimeFields = ({ disabled }: LocationTimeFieldsProps) => {
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext<CreateEventInput>();

  const dateError = errors as {
    startDate?: { message?: string };
    endDate?: { message?: string };
  };

  return (
    <EventFormSection
      title="Ubicación y Horarios"
      description="Define dónde y cuándo ocurre el evento."
    >
      <Grid container spacing={3} className={styles.fullWidthGrid}>
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
                error={!!dateError.startDate}
                helperText={dateError.startDate?.message}
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
                error={!!dateError.endDate}
                helperText={dateError.endDate?.message}
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
    </EventFormSection>
  );
};
