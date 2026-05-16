import AlternateEmailIcon from "@mui/icons-material/AlternateEmail";
import ImageIcon from "@mui/icons-material/Image";
import TagIcon from "@mui/icons-material/Tag";
import VideoFileIcon from "@mui/icons-material/VideoFile";
import ViewCarouselIcon from "@mui/icons-material/ViewCarousel";
import WallpaperIcon from "@mui/icons-material/Wallpaper";

import ImagePreview from "@/components/media/ImagePreview";
import MultipleImagePreview from "@/components/media/MultipleImagePreview";
import VideoPreview from "@/components/media/VideoPreview";
import { Grid, InputAdornment, TextField } from "@mui/material";
import { useFormContext } from "react-hook-form";
import type { CreateEventInput } from "../../types";
import { EventFormSection } from "./EventFormSection";

import styles from "./formSections.module.css";

export const MediaConfigFields = ({ disabled }: { disabled: boolean }) => {
  const {
    register,
    watch,
    formState: { errors },
  } = useFormContext<CreateEventInput>();

  const logoFile = watch("logo");
  const heroImageFile = watch("heroImage");
  const backgroundImageFile = watch("backgroundImage");
  const promotionalImagesFiles = watch("promotionalImages");
  const promotionalVideoFile = watch("promotionalVideo");

  return (
    <EventFormSection
      title="Configuración y Multimedia"
      description="Subí recursos visuales y enlaces para componer la experiencia pública del evento."
    >
      <Grid container spacing={3} className={styles.fullWidthGrid}>
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
          <ImagePreview value={logoFile} label="Logo" />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            type="file"
            label="Imagen Principal (Hero)"
            InputLabelProps={{ shrink: true }}
            inputProps={{ accept: "image/*" }}
            {...register("heroImage")}
            error={!!errors.heroImage}
            disabled={disabled}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <ViewCarouselIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
          />
          <ImagePreview value={heroImageFile} label="Imagen Principal" />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            type="file"
            label="Imagen de Fondo (Background)"
            InputLabelProps={{ shrink: true }}
            inputProps={{ accept: "image/*" }}
            {...register("backgroundImage")}
            error={!!errors.backgroundImage}
            disabled={disabled}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <WallpaperIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
          />
          <ImagePreview value={backgroundImageFile} label="Fondo" />
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
            disabled={disabled}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <ImageIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
          />
          <MultipleImagePreview
            value={promotionalImagesFiles}
            label="Imágenes Promocionales"
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
            disabled={disabled}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <VideoFileIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
          />
          <VideoPreview
            value={promotionalVideoFile}
            label="Video Promocional"
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Hashtag oficial"
            placeholder="#MiEvento2026"
            {...register("hashtag")}
            error={!!errors.hashtag}
            helperText={errors.hashtag?.message}
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
              errors.contactInfo?.message || "Ingresa un contacto por línea."
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
    </EventFormSection>
  );
};
