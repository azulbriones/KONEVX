import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import SendIcon from "@mui/icons-material/Send";
import { useMemo, useState } from "react";

import { getErrorMessage } from "@/features/utils/getErrorMessage";
import { usePublicRegister } from "../hooks/usePublicRegister";
import type {
	ContactRequirement,
	PublicEventField,
	PublicRegisterInput,
} from "../types";
import { FieldInput } from "./../fields/FieldInput";

type Props = {
	slug: string;
	contactRequirement: ContactRequirement;
	fields: PublicEventField[];
	disabled?: boolean;
};

type Errors = Record<string, string | undefined>;
type SubmittedStatus = "CREATED" | "EXISTS" | null;

function initialAnswers(fields: PublicEventField[]) {
	const out: Record<string, unknown> = {};
	for (const f of fields) {
		if (f.type === "CHECKBOX") out[f.key] = false;
		else if (f.type === "MULTI_SELECT") out[f.key] = [];
		else out[f.key] = "";
	}
	return out;
}

export function PublicRegisterForm({
	slug,
	contactRequirement,
	fields,
	disabled,
}: Props) {
	const registerMutation = usePublicRegister(slug);

	const sortedFields = useMemo(
		() => [...fields].sort((a, b) => a.order - b.order),
		[fields],
	);

	const [submittedStatus, setSubmittedStatus] =
		useState<SubmittedStatus>(null);

	const [contact, setContact] = useState<{ email: string; phone: string }>({
		email: "",
		phone: "",
	});

	const [answers, setAnswers] = useState<Record<string, unknown>>(() =>
		initialAnswers(sortedFields),
	);

	const [errors, setErrors] = useState<Errors>({});

	const isFullError =
		(registerMutation.error as any)?.code === "EVENT_FULL" ||
		(registerMutation.error as any)?.error?.code === "EVENT_FULL";

	const busy = registerMutation.isPending || !!disabled || isFullError;

	const validate = (): boolean => {
		const next: Errors = {};

		if (contactRequirement === "EMAIL") {
			if (!contact.email.trim()) next.contact_email = "Email requerido";
		} else {
			if (!contact.phone.trim())
				next.contact_phone = "Teléfono requerido";
		}

		for (const f of sortedFields) {
			if (!f.required) continue;
			const v = answers[f.key];

			if (f.type === "CHECKBOX") {
				if (v !== true) next[f.key] = "Este campo es requerido";
				continue;
			}

			if (f.type === "MULTI_SELECT") {
				if (!Array.isArray(v) || v.length === 0)
					next[f.key] = "Selecciona al menos una opción";
				continue;
			}

			if (v === null || v === undefined || String(v).trim() === "") {
				next[f.key] = "Este campo es requerido";
			}
		}

		setErrors(next);
		return Object.keys(next).length === 0;
	};

	const onSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (busy) return;
		if (!validate()) return;

		const payload: PublicRegisterInput = {
			contact: {
				email: contact.email.trim() || null,
				phone: contact.phone.trim() || null,
			},
			answers,
		};

		registerMutation.mutate(payload, {
			onSuccess: (res: any) => {
				setSubmittedStatus(
					res?.status === "EXISTS" ? "EXISTS" : "CREATED",
				);
				window.scrollTo({ top: 0, behavior: "smooth" });
			},
		});
	};

	const resetForm = () => {
		setSubmittedStatus(null);
		setContact({ email: "", phone: "" });
		setAnswers(initialAnswers(sortedFields));
		setErrors({});
		registerMutation.reset?.();
	};

	if (submittedStatus) {
		return (
			<div className="form-card">
				<div className="success">
					<div className="success-badge">
						<CheckCircleIcon fontSize="large" />
					</div>

					<h2 style={{ fontSize: "2rem", fontWeight: 950 }}>
						{submittedStatus === "EXISTS"
							? "Ya estabas registrado"
							: "¡Registro exitoso!"}
					</h2>

					<p
						style={{
							color: "#64748b",
							marginTop: "0.75rem",
							marginBottom: "1.5rem",
						}}
					>
						{submittedStatus === "EXISTS"
							? "Este contacto ya tenía un registro para este evento. Si necesitas corregir algo, contacta al organizador."
							: "Gracias por registrarte. Te esperamos en el evento."}
					</p>

					<button
						className="public-cta"
						type="button"
						onClick={resetForm}
					>
						Hacer otro registro
					</button>
				</div>
			</div>
		);
	}

	return (
		<section id="registro" className="form-wrap">
			<div className="form-card">
				<div className="form-title">
					<h2>Inscripción</h2>
					<p>Completa tus datos para asegurar tu lugar.</p>
				</div>

				{disabled ? (
					<div className="banner banner--danger" role="status">
						<strong>Cupo lleno.</strong> Ya no es posible
						registrarse.
					</div>
				) : null}

				<form onSubmit={onSubmit}>
					<span className="group-label">Contacto</span>

					<div className="form-grid">
						<div
							className={`field ${contactRequirement === "EMAIL" ? "full" : ""}`}
						>
							<label>
								Email{" "}
								{contactRequirement === "EMAIL" ? "*" : ""}
							</label>
							<input
								type="email"
								value={contact.email}
								onChange={(e) =>
									setContact((p) => ({
										...p,
										email: e.target.value,
									}))
								}
								disabled={busy}
								placeholder="person@example.com"
							/>
							{errors.contact_email ? (
								<div className="field-error">
									{errors.contact_email}
								</div>
							) : null}
						</div>

						<div
							className={`field ${contactRequirement === "PHONE" ? "full" : ""}`}
						>
							<label>
								Teléfono{" "}
								{contactRequirement === "PHONE" ? "*" : ""}
							</label>
							<input
								type="tel"
								value={contact.phone}
								onChange={(e) =>
									setContact((p) => ({
										...p,
										phone: e.target.value,
									}))
								}
								disabled={busy}
								placeholder="9796859595"
							/>
							{errors.contact_phone ? (
								<div className="field-error">
									{errors.contact_phone}
								</div>
							) : null}
						</div>
					</div>

					<span className="group-label">Formulario</span>

					<div className="form-grid">
						{sortedFields.map((f) => (
							<div
								key={f.id}
								className={f.type !== "CHECKBOX" ? "" : "full"}
							>
								<FieldInput
									field={f}
									value={answers[f.key]}
									onChange={(next) =>
										setAnswers((p) => ({
											...p,
											[f.key]: next,
										}))
									}
									error={errors[f.key]}
								/>
							</div>
						))}
					</div>

					{registerMutation.isError ? (
						<div style={{ marginTop: "1rem" }}>
							<div className="banner banner--danger" role="alert">
								<strong>
									{isFullError
										? "Cupo lleno."
										: "No se pudo registrar."}
								</strong>{" "}
								{isFullError
									? "Ya no hay lugares disponibles."
									: getErrorMessage(registerMutation.error)}
							</div>
						</div>
					) : null}

					<button className="submit" type="submit" disabled={busy}>
						{busy ? "Enviando..." : "ENVIAR MI REGISTRO"}{" "}
						<SendIcon />
					</button>
				</form>
			</div>
		</section>
	);
}
