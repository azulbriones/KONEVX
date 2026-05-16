import {
  Alert,
  Box,
  FormControl,
  FormControlLabel,
  FormHelperText,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import { Controller, type Control, type FieldValues } from "react-hook-form";

import styles from "./formSections.module.css";

type SelectField = {
  id: number;
  type: string;
  label: string;
  options?: string[];
};

type Props = {
  disabled?: boolean;
  control: Control<FieldValues>;
  enabled: boolean;
  customFieldId: number | null | "";
  hasSubgroups: boolean;
  selectFields: SelectField[];
  selectedField?: SelectField;
};

export const GroupingSettingsEditor = ({
  disabled,
  control,
  enabled,
  customFieldId,
  hasSubgroups,
  selectFields,
  selectedField,
}: Props) => {
  return (
    <>
      <Grid item xs={12}>
        <Box className={styles.groupingToggleWrap}>
          <Controller
            name="groupingSettings.enabled"
            control={control}
            defaultValue={false}
            render={({ field }) => (
              <FormControlLabel
                control={
                  <Switch
                    {...field}
                    checked={!!field.value}
                    disabled={disabled}
                  />
                }
                label="Habilitar Agrupación Automática"
              />
            )}
          />
        </Box>
      </Grid>

      {enabled && (
        <Grid item xs={12}>
          <Box className={styles.groupingPanel}>
            {selectFields.length === 0 ? (
              <Alert severity="warning">
                No tienes campos de tipo "Selector Único". Ve a la pestaña de
                "Formulario" para crearlos.
              </Alert>
            ) : (
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Controller
                    name="groupingSettings.customFieldId"
                    control={control}
                    defaultValue=""
                    render={({ field, fieldState: { error } }) => (
                      <FormControl
                        fullWidth
                        error={!!error}
                        disabled={disabled}
                      >
                        <InputLabel>Campo Base (Select)</InputLabel>
                        <Select {...field} label="Campo Base (Select)">
                          <MenuItem value="">
                            <em>Seleccione un campo</em>
                          </MenuItem>
                          {selectFields.map((f) => (
                            <MenuItem key={f.id} value={f.id}>
                              {f.label}
                            </MenuItem>
                          ))}
                        </Select>
                        {error && (
                          <FormHelperText>{error.message}</FormHelperText>
                        )}
                      </FormControl>
                    )}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <Controller
                    name="groupingSettings.hasSubgroups"
                    control={control}
                    defaultValue={false}
                    render={({ field }) => (
                      <FormControlLabel
                        control={
                          <Switch
                            {...field}
                            checked={!!field.value}
                            disabled={disabled || !customFieldId}
                          />
                        }
                        label="Dividir en subgrupos (ej: Varios cuartos)"
                        className={styles.subgroupsToggle}
                      />
                    )}
                  />
                </Grid>

                {customFieldId &&
                  selectedField &&
                  Array.isArray(selectedField.options) && (
                    <Grid item xs={12}>
                      <Typography
                        variant="subtitle2"
                        gutterBottom
                        className={styles.distributionTitle}
                      >
                        Distribución
                      </Typography>
                      {selectedField.options.map((option) => (
                        <Box key={option} className={styles.distributionRow}>
                          <Typography className={styles.optionLabel}>
                            {option}
                          </Typography>
                          <Controller
                            name={`groupingSettings.distribution.${option}.prefix`}
                            control={control}
                            defaultValue=""
                            render={({ field, fieldState: { error } }) => (
                              <TextField
                                {...field}
                                value={field.value || ""}
                                label="Prefijo (Ej: A)"
                                size="small"
                                disabled={disabled}
                                error={!!error}
                                helperText={error?.message}
                              />
                            )}
                          />

                          {hasSubgroups && (
                            <Controller
                              name={`groupingSettings.distribution.${option}.subgroupsCount`}
                              control={control}
                              defaultValue={1}
                              render={({
                                field: { value, onChange, ...rest },
                                fieldState: { error },
                              }) => (
                                <TextField
                                  {...rest}
                                  value={value}
                                  onChange={(e) =>
                                    onChange(
                                      e.target.value === ""
                                        ? ""
                                        : Number(e.target.value),
                                    )
                                  }
                                  type="number"
                                  label="N° de Subgrupos"
                                  size="small"
                                  disabled={disabled}
                                  error={!!error}
                                  helperText={error?.message}
                                  InputProps={{ inputProps: { min: 1 } }}
                                  className={styles.subgroupsField}
                                />
                              )}
                            />
                          )}
                        </Box>
                      ))}
                    </Grid>
                  )}
              </Grid>
            )}
          </Box>
        </Grid>
      )}
    </>
  );
};
