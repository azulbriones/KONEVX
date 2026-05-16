import { Checkbox, FormControlLabel, MenuItem, TextField } from "@mui/material";

type RegistrationField = {
  key: string;
  label: string;
  type: string;
  options?: string[];
  order?: number;
};

type RegistrationFieldEditorProps = {
  field: RegistrationField;
  value: unknown;
  onChange: (key: string, value: unknown) => void;
};

export const RegistrationFieldEditor = ({
  field,
  value,
  onChange,
}: RegistrationFieldEditorProps) => {
  const options = Array.isArray(field.options) ? field.options : [];

  const updateValue = (nextValue: unknown) => {
    onChange(field.key, nextValue);
  };

  if (field.type === "CHECKBOX") {
    return (
      <FormControlLabel
        control={
          <Checkbox
            checked={!!value}
            onChange={(event) => updateValue(event.target.checked)}
          />
        }
        label={field.label}
      />
    );
  }

  if (field.type === "SELECT") {
    return (
      <TextField
        select
        label={field.label}
        fullWidth
        value={value || ""}
        onChange={(event) => updateValue(event.target.value)}
      >
        <MenuItem value="">
          <em>Seleccione...</em>
        </MenuItem>
        {options.map((option) => (
          <MenuItem key={option} value={option}>
            {option}
          </MenuItem>
        ))}
      </TextField>
    );
  }

  if (field.type === "MULTI_SELECT") {
    return (
      <TextField
        select
        SelectProps={{
          multiple: true,
          renderValue: (selected: unknown) =>
            (Array.isArray(selected) ? selected : []).join(", "),
        }}
        label={field.label}
        fullWidth
        value={Array.isArray(value) ? value : []}
        onChange={(event) => updateValue(event.target.value)}
      >
        {options.map((option) => (
          <MenuItem key={option} value={option}>
            <Checkbox checked={Array.isArray(value) && value.includes(option)} />
            {option}
          </MenuItem>
        ))}
      </TextField>
    );
  }

  if (field.type === "DATE") {
    return (
      <TextField
        type="date"
        label={field.label}
        fullWidth
        InputLabelProps={{ shrink: true }}
        value={value || ""}
        onChange={(event) => updateValue(event.target.value)}
      />
    );
  }

  if (field.type === "TEXTAREA") {
    return (
      <TextField
        label={field.label}
        fullWidth
        multiline
        minRows={3}
        value={value || ""}
        onChange={(event) => updateValue(event.target.value)}
      />
    );
  }

  return (
    <TextField
      label={field.label}
      fullWidth
      value={value || ""}
      onChange={(event) => updateValue(event.target.value)}
    />
  );
};

export type { RegistrationField };
