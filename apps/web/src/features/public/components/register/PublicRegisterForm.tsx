import BackpackIcon from "@mui/icons-material/Backpack";
import BlockIcon from "@mui/icons-material/Block";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import FacebookIcon from "@mui/icons-material/Facebook";
import InstagramIcon from "@mui/icons-material/Instagram";
import LanguageIcon from "@mui/icons-material/Language";
import SendIcon from "@mui/icons-material/Send";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import XIcon from "@mui/icons-material/X";
import YouTubeIcon from "@mui/icons-material/YouTube";
import {
	Box,
	CircularProgress,
	Divider,
	Paper,
	Stack,
	SvgIcon,
	Typography,
} from "@mui/material";
import confetti from "canvas-confetti";
import { useEffect, useMemo, useRef, useState } from "react";
import QRCode from "react-qr-code";
import type { ComponentType, FormEvent } from "react";
import type { SvgIconProps } from "@mui/material/SvgIcon";

import { getErrorMessage } from "@/features/utils/getErrorMessage";
import { FieldInput } from "../../fields/FieldInput";
import { usePublicRegister } from "../../hooks/usePublicRegister";
import type { ContactRequirement, PublicEventField } from "../../types";

// --- TIPOS ---
type Props = {
	slug: string;
	contactRequirement: ContactRequirement;
	fields: PublicEventField[];
	disabled?: boolean;
	thingsToBring?: string | null;
	thingsNotToBring?: string | null;
	socialMediaInfo?: string | null;
};

type Errors = Record<string, string | undefined>;
type SubmittedStatus = "CREATED" | "EXISTS" | null;

// 💡 Ícono de TikTok Personalizado
const TikTokIcon = (props: SvgIconProps) => (
	<SvgIcon {...props} viewBox="0 0 448 512">
		<path d="M448,209.91a210.06,210.06,0,0,1-122.77-39.25V349.38A162.55,162.55,0,1,1,185,188.31V278.2a74.62,74.62,0,1,0,52.23,71.18V0l88,0a121.18,121.18,0,0,0,1.86,22.17h0A122.18,122.18,0,0,0,381,102.39a121.43,121.43,0,0,0,67,20.14Z" />
	</SvgIcon>
);

type RegisterMutationError = {
	code?: string;
	error?: {
		code?: string;
	};
};

function hasEventFullCode(error: unknown): error is RegisterMutationError {
	if (!error || typeof error !== "object") return false;
	const candidate = error as RegisterMutationError;
	return candidate.code === "EVENT_FULL" || candidate.error?.code === "EVENT_FULL";
}

// --- HELPERS ---
function initialAnswers(fields: PublicEventField[]) {
	const out: Record<string, unknown> = {};
	for (const f of fields) {
		if (f.type === "CHECKBOX") out[f.key] = false;
		else if (f.type === "MULTI_SELECT") out[f.key] = [];
		else out[f.key] = "";
	}
	return out;
}

function DynamicSocialLink({ link }: { link: string }) {
	const cleanLink = link.replace(/[\u200E\u200F\u202A-\u202E]/g, "").trim();
	const lower = cleanLink.toLowerCase();

	let Icon: ComponentType<SvgIconProps> = LanguageIcon;
	let className = "social-btn";
	let href = cleanLink;

	const digits = cleanLink.replace(/\D/g, "");
	const isJustNumber =
		digits.length >= 10 &&
		!cleanLink.includes(".com") &&
		!cleanLink.includes("/");

	if (lower.includes("facebook")) {
		Icon = FacebookIcon;
		className += " facebook";
	} else if (lower.includes("instagram") || lower.includes("ig")) {
		Icon = InstagramIcon;
		className += " instagram";
	} else if (lower.includes("twitter") || lower.includes("x.com")) {
		Icon = XIcon;
		className += " x-social";
	} else if (lower.includes("tiktok")) {
		Icon = TikTokIcon; // 👈 Detección de TikTok
		className += " tiktok"; // Puedes crear un .tiktok { background: black } en tu CSS
	} else if (
		lower.includes("whatsapp") ||
		lower.includes("wa.me") ||
		isJustNumber
	) {
		Icon = WhatsAppIcon;
		className += " whatsapp";
		if (
			isJustNumber &&
			!lower.includes("wa.me") &&
			!lower.includes("whatsapp.com")
		) {
			href = `https://wa.me/${digits}`;
		}
	} else if (lower.includes("youtube")) {
		Icon = YouTubeIcon;
		className += " youtube";
	}

	if (!href.startsWith("http") && href.includes(".com")) {
		href = `https://${href}`;
	}

	return (
		<a
			href={href}
			target="_blank"
			rel="noreferrer"
			className={className}
			style={{ textDecoration: "none" }}
		>
			<Icon />
		</a>
	);
}

// --- SUB-COMPONENTE: VISTA DE ÉXITO ---
function SuccessView({
	status,
	regId,
	onReset,
	thingsToBring,
	thingsNotToBring,
	socialMediaInfo,
}: {
	status: SubmittedStatus;
	regId?: number;
	onReset: () => void;
	thingsToBring?: string | null;
	thingsNotToBring?: string | null;
	socialMediaInfo?: string | null;
}) {
	useEffect(() => {
		const end = Date.now() + 3 * 1000;
		const colors = ["#14b8a6", "#38bdf8", "#22c55e"];

		const frame = () => {
			confetti({
				particleCount: 2,
				angle: 60,
				spread: 55,
				origin: { x: 0, y: 0.8 },
				colors,
			});
			confetti({
				particleCount: 2,
				angle: 120,
				spread: 55,
				origin: { x: 1, y: 0.8 },
				colors,
			});

			if (Date.now() < end) requestAnimationFrame(frame);
		};
		frame();
	}, []);

	const bringList =
		thingsToBring
			?.split("\n")
			.map((i) => i.trim())
			.filter(Boolean) || [];
	const avoidList =
		thingsNotToBring
			?.split("\n")
			.map((i) => i.trim())
			.filter(Boolean) || [];
	const socials =
		socialMediaInfo
			?.split("\n")
			.map((s) => s.trim())
			.filter(Boolean) || [];

	return (
		<div className="form-card success-card mobile-friendly">
			<div className="success">
				<div className="success-badge pulse">
					<CheckCircleIcon sx={{ fontSize: 48 }} />
				</div>

				<Stack spacing={1} sx={{ mb: 2 }}>
					<Typography variant="overline" fontWeight={900} color="primary.main" letterSpacing={1}>
						Registro confirmado
					</Typography>
					<h2 className="success-title">
						{status === "EXISTS"
							? "Ya estabas registrado"
							: "¡Registro exitoso!"}
					</h2>
				</Stack>

				<Box
					sx={{
						mt: 3,
						mb: 2,
						p: 3,
						bgcolor: "background.paper",
						borderRadius: 4,
						border: "1px solid",
						borderColor: "divider",
						boxShadow: "0 12px 30px rgba(15, 23, 42, 0.08)",
						display: "flex",
						flexDirection: "column",
						alignItems: "center",
					}}
				>
					<Typography
						variant="overline"
						fontWeight={900}
						color="primary.main"
						fontSize="0.9rem"
						letterSpacing={1}
					>
						TU PASE DE ENTRADA
					</Typography>

					{regId ? (
						<Box
							sx={{
								p: 2,
								bgcolor: "white",
								borderRadius: "1rem",
								my: 2,
								boxShadow: "0 4px 14px rgba(0,0,0,0.08)",
							}}
						>
							<QRCode
								value={regId.toString()}
								size={180}
								level="H"
							/>
						</Box>
					) : (
						<Box sx={{ my: 4 }}>
							<CircularProgress />
						</Box>
					)}

					<div
						className="registration-id-box"
						style={{
							width: "100%",
							margin: 0,
							border: "none",
							padding: "0.5rem",
						background: "rgba(37,99,235,0.05)",
					}}
					>
						<span className="id-label">ID DE REGISTRO</span>
						<strong className="id-number">#{regId || "---"}</strong>
					</div>
				</Box>

				<Paper variant="outlined" sx={{ p: 2.5, mb: 2, borderRadius: 4, bgcolor: "#fffbeb", borderColor: "#fde68a", textAlign: "left" }}>
					<Typography variant="body2" fontWeight={800} color="#92400e">
						📸 Guarda tu número de registro o imprime el código QR.
					</Typography>
					<Typography variant="body2" sx={{ mt: 0.5, color: "#92400e" }}>
						Llévalo contigo el día de la entrada para un acceso más rápido.
					</Typography>
				</Paper>

				<Divider className="divider" />

				{(bringList.length > 0 || avoidList.length > 0) && (
					<div className="preparation-summary">
						<Typography variant="h6" fontWeight={900} mb={2}>
							🎒 Información de Viaje
						</Typography>
						<Stack spacing={2}>
							{bringList.length > 0 && (
								<Box className="info-box good">
									<Stack
										direction="row"
										spacing={1}
										alignItems="center"
										mb={1}
									>
										<BackpackIcon fontSize="small" />
										<strong>Qué llevar:</strong>
									</Stack>
									<ul
										style={{
											paddingLeft: "1.2rem",
											margin: 0,
											textAlign: "left",
										}}
									>
										{bringList.map((item, i) => (
											<li key={i}>{item}</li>
										))}
									</ul>
								</Box>
							)}
							{avoidList.length > 0 && (
								<Box className="info-box bad">
									<Stack
										direction="row"
										spacing={1}
										alignItems="center"
										mb={1}
									>
										<BlockIcon fontSize="small" />
										<strong>No llevar:</strong>
									</Stack>
									<ul
										style={{
											paddingLeft: "1.2rem",
											margin: 0,
											textAlign: "left",
										}}
									>
										{avoidList.map((item, i) => (
											<li key={i}>{item}</li>
										))}
									</ul>
								</Box>
							)}
						</Stack>
					</div>
				)}

				{socials.length > 0 && (
					<>
						<Divider className="divider" />
						<div className="social-invite">
							<p
								style={{
									fontWeight: 700,
									color: "#64748b",
									marginBottom: "1rem",
								}}
							>
								¡No olvides seguirnos!
							</p>
							<Stack
								direction="row"
								spacing={2}
								justifyContent="center"
								flexWrap="wrap"
								useFlexGap
							>
								{socials.map((link, index) => (
									<DynamicSocialLink
										key={index}
										link={link}
									/>
								))}
							</Stack>
						</div>
					</>
				)}

				<Stack className="success-actions" direction={{ xs: "column", sm: "row" }} sx={{ mt: 3 }}>
					<button
						className="public-cta"
						type="button"
						onClick={onReset}
					>
						Nuevo registro
					</button>
					<button
						className="btn-secondary"
						type="button"
						onClick={() =>
							window.scrollTo({ top: 0, behavior: "smooth" })
						}
						style={{ border: "none", borderRadius: "9999px" }}
					>
						Ver detalles
					</button>
				</Stack>
			</div>
		</div>
	);
}

// --- COMPONENTE PRINCIPAL ---
export function PublicRegisterForm({
	slug,
	contactRequirement,
	fields,
	disabled,
	thingsToBring,
	thingsNotToBring,
	socialMediaInfo,
}: Props) {
	const registerMutation = usePublicRegister(slug);
	const [submittedStatus, setSubmittedStatus] =
		useState<SubmittedStatus>(null);
	const [contact, setContact] = useState({ email: "", phone: "" });
	const [errors, setErrors] = useState<Errors>({});
	const [submitAttempted, setSubmitAttempted] = useState(false);
	const validationBannerRef = useRef<HTMLDivElement>(null);

	const sortedFields = useMemo(
		() => [...fields].sort((a, b) => a.order - b.order),
		[fields],
	);
	const [answers, setAnswers] = useState(() => initialAnswers(sortedFields));

	const isFullError = hasEventFullCode(registerMutation.error);

	const busy = registerMutation.isPending || !!disabled || isFullError;

	const focusFirstError = (nextErrors: Errors) => {
		const firstKey =
			nextErrors.contact_email ? "contact" :
			nextErrors.contact_phone ? "contact" :
			Object.keys(nextErrors)[0];

		if (!firstKey) return;

		const selector = `[data-field-key="${firstKey}"]`;
		const el = document.querySelector(selector) as HTMLElement | null;
		el?.scrollIntoView({ behavior: "smooth", block: "center" });
		const focusable = el?.querySelector(
			"input, textarea, select, button",
		) as HTMLElement | null;
		focusable?.focus?.();
	};

	const clearError = (key: string) => {
		setErrors((prev) => {
			if (!(key in prev)) return prev;
			const next = { ...prev };
			delete next[key];
			return next;
		});
	};

	const validate = (): Errors | null => {
		const next: Errors = {};
		if (contactRequirement === "EMAIL") {
			const email = contact.email.trim();
			if (!email) next.contact_email = "Email requerido";
			else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
				next.contact_email = "Email inválido";
			}
		} else {
			const phone = contact.phone.trim();
			if (!phone)
				next.contact_phone = "Teléfono requerido";
			else if (phone.replace(/\D/g, "").length < 10) {
				next.contact_phone = "Teléfono inválido";
			}
		}

		for (const f of sortedFields) {
			if (!f.required) continue;
			const v = answers[f.key];
			if (f.type === "CHECKBOX" && v !== true) next[f.key] = "Requerido";
			else if (
				f.type === "MULTI_SELECT" &&
				(!Array.isArray(v) || v.length === 0)
			)
				next[f.key] = "Selecciona uno";
				else if (v === null || v === undefined || String(v).trim() === "")
					next[f.key] = "Requerido";
		}
		setErrors(next);
		return Object.keys(next).length === 0 ? null : next;
	};

	const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setSubmitAttempted(true);
		const validationErrors = validate();
		if (busy || validationErrors) {
			if (validationErrors) focusFirstError(validationErrors);
			validationBannerRef.current?.scrollIntoView({
				behavior: "smooth",
				block: "center",
			});
			return;
		}
		registerMutation.mutate(
			{
				contact: {
					email: contact.email.trim() || null,
					phone: contact.phone.trim() || null,
				},
				answers,
			},
			{
				onSuccess: (res) =>
					setSubmittedStatus(res.status === "EXISTS" ? "EXISTS" : "CREATED"),
			},
		);
	};

	const resetForm = () => {
		setSubmittedStatus(null);
		setContact({ email: "", phone: "" });
		setAnswers(initialAnswers(sortedFields));
		setErrors({});
		setSubmitAttempted(false);
		registerMutation.reset?.();
	};

	if (submittedStatus) {
		return (
			<SuccessView
				status={submittedStatus}
				regId={registerMutation.data?.registration?.id}
				onReset={resetForm}
				thingsToBring={thingsToBring}
				thingsNotToBring={thingsNotToBring}
				socialMediaInfo={socialMediaInfo}
			/>
		);
	}

	return (
		<section id="registro" className="form-wrap">
			<div className="form-card">
				<div className="form-title">
					<Typography variant="overline" fontWeight={900} color="primary.main" letterSpacing={1}>
						Registro público
					</Typography>
					<h2>Inscripción</h2>
					<p>Asegura tu lugar completando tus datos.</p>
				</div>

				{disabled && (
					<div
						className="banner banner--danger"
						style={{ marginBottom: "2rem" }}
					>
						<strong>Cupo lleno.</strong> Ya no aceptamos registros.
					</div>
				)}

				{submitAttempted && Object.keys(errors).length > 0 && (
					<div
						ref={validationBannerRef}
						className="banner banner--warn"
						style={{ marginBottom: "1.5rem" }}
						aria-live="polite"
					>
						<strong>Revisa el formulario.</strong> Hay campos obligatorios sin completar.
					</div>
				)}

				<form onSubmit={onSubmit} noValidate>
					<span className="group-label">Contacto</span>
					<div className="form-grid">
						<div className="field full" data-field-key="contact">
							<label>
								{contactRequirement === "EMAIL"
									? "Correo Electrónico *"
									: "Número de Teléfono *"}
							</label>
							<input
								type={
									contactRequirement === "EMAIL"
										? "email"
										: "tel"
								}
								value={
									contactRequirement === "EMAIL"
										? contact.email
										: contact.phone
								}
								onChange={(e) =>
									{
										setContact((p) => ({
											...p,
											[contactRequirement === "EMAIL"
												? "email"
												: "phone"]: e.target.value,
										}));
										clearError(
											contactRequirement === "EMAIL"
												? "contact_email"
												: "contact_phone",
										);
										if (registerMutation.isError) registerMutation.reset();
									}
								}
								disabled={busy}
								placeholder={
									contactRequirement === "EMAIL"
										? "ejemplo@correo.com"
										: "961 123 4567"
								}
							/>
							{(errors.contact_email || errors.contact_phone) && (
								<div className="field-error">
									{errors.contact_email || errors.contact_phone}
								</div>
							)}
						</div>
					</div>

					<span className="group-label">Información Adicional</span>
					<div className="form-grid">
						{sortedFields.map((f) => (
							<div
								key={f.id}
								className={
									f.type === "CHECKBOX" ||
									f.type === "TEXTAREA"
										? "full"
										: ""
								}
							>
								<FieldInput
									field={f}
									value={answers[f.key]}
									onChange={(next) =>
										{
											setAnswers((p) => ({
												...p,
												[f.key]: next,
											}));
											clearError(f.key);
											if (registerMutation.isError) registerMutation.reset();
										}
									}
									error={errors[f.key]}
								/>
							</div>
						))}
					</div>

					{registerMutation.isError && (
						<div style={{ marginTop: "1.5rem" }}>
							<div className="banner banner--danger">
								<strong>Error:</strong>{" "}
								{getErrorMessage(registerMutation.error)}
							</div>
						</div>
					)}

					<button className="submit" type="submit" disabled={busy}>
						{registerMutation.isPending
							? "Enviando..."
							: "ENVIAR MI REGISTRO"}{" "}
						<SendIcon />
					</button>
				</form>
			</div>
		</section>
	);
}
