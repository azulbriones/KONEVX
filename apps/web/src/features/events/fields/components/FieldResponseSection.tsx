import {
  Box,
  Checkbox,
  FormControl,
  FormControlLabel,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import { Controller } from "react-hook-form";

import { useFieldDrawerController } from "../hooks/useFieldDrawerController";
import styles from "./FieldDrawerContent.module.css";

type FieldResponseSectionProps = {
  controller: ReturnType<typeof useFieldDrawerController>;
};

export const FieldResponseSection = ({ controller }: FieldResponseSectionProps) => {
  return (
    <>
      <Box>
        <Typography variant="subtitle2" gutterBottom fontWeight={600}>
          Tipo de Respuesta
        </Typography>

        <Controller
          name="type"
          control={controller.control}
          render={({ field }) => (
            <FormControl
              fullWidth
              error={!!controller.errors.type}
              className={styles.typeControl}
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
                  Texto Corto (Ej: Nombre, Teléfono)
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
                  Menú Desplegable (Una sola opción)
                </MenuItem>
                <MenuItem value="MULTI_SELECT">
                  Selección Múltiple (Varias opciones)
                </MenuItem>
                <MenuItem value="CHECKBOX">
                  Casilla de verificación (Sí/No)
                </MenuItem>
              </Select>
              {controller.errors.type && (
                <FormHelperText>
                  {controller.errors.type.message}
                </FormHelperText>
              )}
            </FormControl>
          )}
        />

        {controller.showOptions && (
          <TextField
            label="Opciones disponibles"
            placeholder={`Masculino
Femenino
Prefiero no decirlo`}
            multiline
            minRows={4}
            {...controller.register("optionsText")}
            error={!!controller.errors.optionsText}
            helperText={
              controller.errors.optionsText?.message ||
              "Escribe una opción por línea y presiona Enter."
            }
            fullWidth
            className={styles.optionsField}
          />
        )}
      </Box>

      <Box className={styles.requiredBox}>
        <Controller
          name="required"
          control={controller.control}
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
                  <Typography variant="body2" fontWeight={600}>
                    Hacer este campo obligatorio
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    El usuario no podrá registrarse sin llenar este dato.
                  </Typography>
                </Box>
              }
            />
          )}
        />
      </Box>
    </>
  );
};
