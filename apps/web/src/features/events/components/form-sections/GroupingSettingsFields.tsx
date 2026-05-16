import { Alert, Grid } from "@mui/material";
import { useEffect } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import { useParams } from "react-router-dom";
import { useEventFields } from "../../hooks/useEventFields";
import { EventFormSection } from "./EventFormSection";
import { GroupingSettingsEditor } from "./GroupingSettingsEditor";
import styles from "./GroupingSettingsFields.module.css";

type SelectField = {
  id: number;
  type: string;
  label: string;
  options?: string[];
};

type GroupingSettingsFieldsProps = {
  disabled?: boolean;
};

export const GroupingSettingsFields = ({
  disabled,
}: GroupingSettingsFieldsProps) => {
  const { control, setValue, getValues } = useFormContext();
  const { eventId } = useParams();
  const isEditMode = Boolean(eventId && !Number.isNaN(Number(eventId)));
  const { data: fields } = useEventFields(isEditMode ? Number(eventId) : 0);

  const allFields: SelectField[] = Array.isArray(fields)
    ? (fields as SelectField[])
    : (fields as { items?: SelectField[] })?.items || [];
  const selectFields = allFields.filter((f) => f.type === "SELECT");

  const enabled = useWatch({ control, name: "groupingSettings.enabled" });
  const customFieldId = useWatch({
    control,
    name: "groupingSettings.customFieldId",
  });
  const hasSubgroups = useWatch({
    control,
    name: "groupingSettings.hasSubgroups",
  });

  useEffect(() => {
    if (!customFieldId) return;

    const selectedField = selectFields.find((f) => f.id === customFieldId);
    if (!selectedField || !Array.isArray(selectedField.options)) return;

    const currentDistribution =
      getValues("groupingSettings.distribution") || {};
    const nextDistribution: Record<
      string,
      { prefix: string; subgroupsCount: number }
    > = {};

    selectedField.options.forEach((opt: string) => {
      nextDistribution[opt] = currentDistribution[opt] || {
        prefix: "",
        subgroupsCount: 1,
      };
    });

    setValue("groupingSettings.distribution", nextDistribution);
  }, [customFieldId, getValues, selectFields, setValue]);

  const selectedField = selectFields.find((f) => f.id === customFieldId);

  return (
    <EventFormSection
      title="Agrupación y Asignación Automática"
      description="Configura si deseas que el sistema asigne automáticamente habitaciones o equipos basándose en las respuestas del formulario."
    >
      <Grid container spacing={3} className={styles.fullWidthGrid}>
        {!isEditMode ? (
          <Grid item xs={12}>
            <Alert severity="info" className={styles.infoAlert}>
              Para configurar la agrupación automática, primero debes guardar el
              evento y crear un campo de tipo "Selector Único" (ej: Género,
              Categoría).
            </Alert>
          </Grid>
        ) : (
          <GroupingSettingsEditor
            disabled={disabled}
            control={control}
            enabled={enabled}
            customFieldId={customFieldId}
            hasSubgroups={hasSubgroups}
            selectFields={selectFields}
            selectedField={selectedField}
          />
        )}
      </Grid>
    </EventFormSection>
  );
};
