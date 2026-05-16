import LinkIcon from "@mui/icons-material/Link";
import { Grid, InputAdornment, TextField } from "@mui/material";
import { useFormContext } from "react-hook-form";
import type { CreateEventInput } from "../../types";
import { EventFormSection } from "./EventFormSection";

import styles from "./formSections.module.css";

type PublicLinkFieldsProps = {
  disabled: boolean;
};

export const PublicLinkFields = ({ disabled }: PublicLinkFieldsProps) => {
  const {
    register,
    formState: { errors },
  } = useFormContext<CreateEventInput>();

  return (
    <EventFormSection
      title="Enlace Público"
      description="Configura el slug para compartir la página del evento."
    >
      <Grid container spacing={3} className={styles.fullWidthGrid}>
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
                  <LinkIcon fontSize="small" className={styles.linkIcon} /> /
                </InputAdornment>
              ),
            }}
          />
        </Grid>
      </Grid>
    </EventFormSection>
  );
};
