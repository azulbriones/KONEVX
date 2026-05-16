import type { PublicEventField } from "../types";

type Props = {
  field: PublicEventField;
  value: unknown;
  onChange: (next: unknown) => void;
  error?: string;
};

export const FieldInput = ({ field, value, onChange, error }: Props) => {
  const requiredMark = field.required ? " *" : "";
  const label = `${field.label}${requiredMark}`;
  const inputId = `public-field-${field.key}`;

  const setString = (nextValue: string) => onChange(nextValue);
  const setNumber = (nextValue: string) => {
    if (nextValue.trim() === "") return onChange(null);
    const parsedValue = Number(nextValue);
    onChange(Number.isFinite(parsedValue) ? parsedValue : null);
  };
  const setBoolean = (nextValue: boolean) => onChange(nextValue);

  if (field.type === "CHECKBOX") {
    return (
      <div className="field" data-field-key={field.key}>
        <div className="checkbox-row">
          <input
            id={inputId}
            type="checkbox"
            checked={Boolean(value)}
            onChange={(e) => setBoolean(e.target.checked)}
          />
          <label htmlFor={inputId} className="field-label field-label--strong">
            {label}
          </label>
        </div>
        {error ? <div className="field-error">{error}</div> : null}
      </div>
    );
  }

  if (field.type === "DATE") {
    return (
      <div className="field" data-field-key={field.key}>
        <label htmlFor={inputId}>{label}</label>
        <input
          id={inputId}
          type="date"
          value={typeof value === "string" ? value : ""}
          onChange={(e) => setString(e.target.value)}
        />
        {error ? <div className="field-error">{error}</div> : null}
      </div>
    );
  }

  if (field.type === "TEXTAREA") {
    return (
      <div className="field" data-field-key={field.key}>
        <label htmlFor={inputId}>{label}</label>
        <textarea
          id={inputId}
          value={typeof value === "string" ? value : ""}
          onChange={(e) => setString(e.target.value)}
          placeholder="Escribe aquí tus comentarios..."
          rows={4}
          className="field-textarea"
        />
        {error ? <div className="field-error">{error}</div> : null}
      </div>
    );
  }

  if (field.type === "NUMBER") {
    return (
      <div className="field" data-field-key={field.key}>
        <label htmlFor={inputId}>{label}</label>
        <input
          id={inputId}
          type="number"
          value={
            typeof value === "number" || typeof value === "string"
              ? String(value)
              : ""
          }
          onChange={(e) => setNumber(e.target.value)}
        />
        {error ? <div className="field-error">{error}</div> : null}
      </div>
    );
  }

  if (field.type === "SELECT") {
    const options = (field.options ?? []) as string[];
    return (
      <div className="field" data-field-key={field.key}>
        <label htmlFor={inputId}>{label}</label>
        <select
          id={inputId}
          value={typeof value === "string" ? value : ""}
          onChange={(e) => setString(e.target.value)}
        >
          <option value="">Selecciona...</option>
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        {error ? <div className="field-error">{error}</div> : null}
      </div>
    );
  }

  if (field.type === "MULTI_SELECT") {
    const options = (field.options ?? []) as string[];
    const selectedValues = Array.isArray(value) ? (value as string[]) : [];

    return (
      <div className="field" data-field-key={field.key}>
        <label htmlFor={inputId}>{label}</label>
        <select
          id={inputId}
          multiple
          value={selectedValues}
          onChange={(e) => {
            const selected = Array.from(e.target.selectedOptions).map(
              (option) => option.value,
            );
            onChange(selected);
          }}
          className="field-select field-select--multi"
        >
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <small>Puedes seleccionar múltiples opciones (Ctrl/Cmd + click).</small>
        {error ? <div className="field-error">{error}</div> : null}
      </div>
    );
  }

  return (
    <div className="field" data-field-key={field.key}>
      <label htmlFor={inputId}>{label}</label>
      <input
        id={inputId}
        type="text"
        value={typeof value === "string" ? value : ""}
        onChange={(e) => setString(e.target.value)}
        placeholder="Escribe aquí..."
      />
      {error ? <div className="field-error">{error}</div> : null}
    </div>
  );
};
