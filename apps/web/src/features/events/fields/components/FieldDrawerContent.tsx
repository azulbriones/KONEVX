import {
  Box,
  Button,
  Divider,
  Drawer,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import { FieldResponseSection } from "./FieldResponseSection";
import { useFieldDrawerController, type FieldDrawerProps } from "../hooks/useFieldDrawerController";
import styles from "./FieldDrawerContent.module.css";

export const FieldDrawerContent = (props: FieldDrawerProps) => {
  const controller = useFieldDrawerController(props);

  return (
    <Drawer
      anchor="right"
      open={props.open}
      onClose={props.onClose}
      PaperProps={{ className: styles.paper }}
    >
      <Box
        component="form"
        onSubmit={controller.handleSubmit((values) =>
          controller.onFormSubmit(values, props.onSubmit),
        )}
        className={styles.form}
      >
        <Box className={styles.header}>
          <Typography variant="h6" fontWeight={800}>
            {props.mode === "create"
              ? "Nuevo Campo Personalizado"
              : "Editar Campo"}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Define la información que los usuarios deberán proporcionar.
          </Typography>
        </Box>

        <Divider />

        <Box className={styles.body}>
          <Stack spacing={4}>
            <Box>
              <Typography variant="subtitle2" gutterBottom fontWeight={600}>
                Configuración Básica
              </Typography>
              <Stack spacing={2.5}>
                <TextField
                  label="Etiqueta visible (Label)"
                  placeholder="Ej: Enfermedad o Alergias"
                  {...controller.register("label")}
                  error={!!controller.errors.label}
                  helperText={
                    controller.errors.label?.message ||
                    "Así es como lo verá el usuario final."
                  }
                  fullWidth
                />

                <TextField
                  label="Identificador interno (Key)"
                  placeholder="ej: enfermedades_alergias"
                  {...controller.register("key")}
                  error={!!controller.errors.key}
                  helperText={
                    controller.errors.key?.message ||
                    "Usado para exportar datos. Debe usar guiones bajos y minúsculas."
                  }
                  disabled={props.mode === "edit"}
                  fullWidth
                />
              </Stack>
            </Box>

            <Divider />

            <FieldResponseSection controller={controller} />
          </Stack>
        </Box>

        <Divider />

        <Box className={styles.footer}>
          <Stack direction="row" justifyContent="flex-end" gap={2}>
            <Button onClick={props.onClose} color="inherit" size="large">
              Cancelar
            </Button>
            <Button type="submit" variant="contained" size="large">
              {props.mode === "create"
                ? "Agregar Campo"
                : "Guardar Cambios"}
            </Button>
          </Stack>
        </Box>
      </Box>
    </Drawer>
  );
};
