import { yupResolver } from "@hookform/resolvers/yup";
import {
  Box,
  Button,
  CircularProgress,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { useEffect } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { CreateEventInput } from "../types";
import { schema } from "../utils/validationSchema";

import { GeneralInfoFields } from "./form-sections/GeneralInfoFields";
import { GroupingSettingsFields } from "./form-sections/GroupingSettingsFields";
import { LocationTimeFields } from "./form-sections/LocationTimeFields";
import { MediaConfigFields } from "./form-sections/MediaConfigFields";
import { PublicLinkFields } from "./form-sections/PublicLinkFields";

import styles from "./EventForm.module.css";

const sanitizeData = (data?: Partial<CreateEventInput> | null) => {
  if (!data) return data;
  const clean = { ...data } as Record<string, unknown>;
  Object.keys(clean).forEach((key) => {
    if (clean[key] === null) {
      clean[key] = undefined;
    }
  });
  return clean as Partial<CreateEventInput>;
};

interface EventFormProps {
  defaultValues?: Partial<CreateEventInput> & { id?: number };
  onSubmit: (data: CreateEventInput) => void;
  isPending: boolean;
  submitLabel: string;
  onCancel: () => void;
}

export const EventForm = ({
  defaultValues,
  onSubmit,
  isPending,
  submitLabel,
  onCancel,
}: EventFormProps) => {
  const methods = useForm<CreateEventInput>({
    resolver: yupResolver(schema),
    defaultValues: {
      name: "",
      slug: "",
      capacity: 100,
      contactRequirement: "EMAIL",
      groupingSettings: {
        enabled: false,
        hasSubgroups: false,
      },
      ...sanitizeData(defaultValues),
    },
  });

  useEffect(() => {
    if (defaultValues) {
      methods.reset(sanitizeData(defaultValues));
    }
  }, [defaultValues, methods]);

  const isEdit = !!defaultValues?.id;
  const title = isEdit ? "Editar" : "Crear";

  return (
    <Box className={styles.wrapper}>
      <Paper variant="outlined" className={styles.paper}>
        <Stack spacing={1.25} className={styles.header}>
          <Typography
            variant="overline"
            color="primary"
            className={styles.overline}
          >
            Gestión de eventos
          </Typography>
          <Typography variant="h4" className={styles.title}>
            {`${title} evento`}
          </Typography>
          <Typography
            variant="body1"
            color="text.secondary"
            className={styles.subtitle}
          >
            Configurá la información principal, recursos visuales y reglas de
            acceso desde un solo lugar.
          </Typography>
        </Stack>

        <FormProvider {...methods}>
          <Box
            component="form"
            onSubmit={methods.handleSubmit(onSubmit)}
            noValidate
            className={styles.form}
          >
            <Stack spacing={3}>
              <GeneralInfoFields disabled={isPending} />
              <LocationTimeFields disabled={isPending} />
              <MediaConfigFields disabled={isPending} />
              <PublicLinkFields disabled={isPending} />
              <GroupingSettingsFields disabled={isPending} />
              <Stack direction="row" spacing={2} justifyContent="flex-end">
                <Button
                  variant="outlined"
                  color="inherit"
                  onClick={onCancel}
                  disabled={isPending}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={isPending}
                  className={styles.submitButton}
                  startIcon={
                    isPending && <CircularProgress size={18} color="inherit" />
                  }
                >
                  {isPending ? "Procesando..." : submitLabel}
                </Button>
              </Stack>
            </Stack>
          </Box>
        </FormProvider>
      </Paper>
    </Box>
  );
};
