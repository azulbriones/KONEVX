import type { PublicEventField } from "../types";

type Props = {
	field: PublicEventField;
	value: unknown;
	onChange: (next: unknown) => void;
	error?: string;
};

export function FieldInput({ field, value, onChange, error }: Props) {
	const requiredMark = field.required ? " *" : "";
	const label = `${field.label}${requiredMark}`;

	// Helpers
	const setString = (v: string) => onChange(v);
	const setNumber = (v: string) => {
		if (v.trim() === "") return onChange(null);
		const n = Number(v);
		onChange(Number.isFinite(n) ? n : null);
	};
	const setBoolean = (v: boolean) => onChange(v);

	if (field.type === "CHECKBOX") {
		return (
			<div className="field">
				<div className="checkbox-row">
					<input
						type="checkbox"
						checked={Boolean(value)}
						onChange={(e) => setBoolean(e.target.checked)}
					/>
					<label style={{ fontWeight: 900 }}>{label}</label>
				</div>
				{error ? <div className="field-error">{error}</div> : null}
			</div>
		);
	}

	if (field.type === "DATE") {
		return (
			<div className="field">
				<label>{label}</label>
				<input
					type="date"
					value={typeof value === "string" ? value : ""}
					onChange={(e) => setString(e.target.value)}
				/>
				{error ? <div className="field-error">{error}</div> : null}
			</div>
		);
	}

	if (field.type === "NUMBER") {
		return (
			<div className="field">
				<label>{label}</label>
				<input
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
			<div className="field">
				<label>{label}</label>
				<select
					value={typeof value === "string" ? value : ""}
					onChange={(e) => setString(e.target.value)}
				>
					<option value="">Selecciona...</option>
					{options.map((o) => (
						<option key={o} value={o}>
							{o}
						</option>
					))}
				</select>
				{error ? <div className="field-error">{error}</div> : null}
			</div>
		);
	}

	if (field.type === "MULTI_SELECT") {
		const options = (field.options ?? []) as string[];
		const arr = Array.isArray(value) ? (value as string[]) : [];

		return (
			<div className="field">
				<label>{label}</label>
				<select
					multiple
					value={arr}
					onChange={(e) => {
						const selected = Array.from(
							e.target.selectedOptions,
						).map((o) => o.value);
						onChange(selected);
					}}
					style={{ minHeight: 120 }}
				>
					{options.map((o) => (
						<option key={o} value={o}>
							{o}
						</option>
					))}
				</select>
				<small>
					Puedes seleccionar múltiples opciones (Ctrl/Cmd + click).
				</small>
				{error ? <div className="field-error">{error}</div> : null}
			</div>
		);
	}

	// TEXT fallback (default)
	return (
		<div className="field">
			<label>{label}</label>
			<input
				type="text"
				value={typeof value === "string" ? value : ""}
				onChange={(e) => setString(e.target.value)}
				placeholder="Escribe aquí..."
			/>
			{error ? <div className="field-error">{error}</div> : null}
		</div>
	);
}
