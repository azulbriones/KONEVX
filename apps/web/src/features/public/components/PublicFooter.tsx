import FacebookIcon from "@mui/icons-material/Facebook";
import InstagramIcon from "@mui/icons-material/Instagram";
import LanguageIcon from "@mui/icons-material/Language";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import XIcon from "@mui/icons-material/X";
import YouTubeIcon from "@mui/icons-material/YouTube";
import { IconButton, SvgIcon, Tooltip } from "@mui/material";

// 💡 Creamos el ícono de TikTok manualmente para asegurar compatibilidad
const TikTokIcon = (props: any) => (
	<SvgIcon {...props} viewBox="0 0 448 512">
		<path d="M448,209.91a210.06,210.06,0,0,1-122.77-39.25V349.38A162.55,162.55,0,1,1,185,188.31V278.2a74.62,74.62,0,1,0,52.23,71.18V0l88,0a121.18,121.18,0,0,0,1.86,22.17h0A122.18,122.18,0,0,0,381,102.39a121.43,121.43,0,0,0,67,20.14Z" />
	</SvgIcon>
);

function SocialIconItem({ linkText }: { linkText: string }) {
	// Limpiamos caracteres invisibles
	const cleanLink = linkText
		.replace(/[\u200E\u200F\u202A-\u202E]/g, "")
		.trim();
	const lower = cleanLink.toLowerCase();

	let Icon: any = LanguageIcon;
	let href = cleanLink;

	// Detectamos si es puramente un número de teléfono (más de 10 dígitos)
	const digits = cleanLink.replace(/\D/g, "");
	const isJustNumber =
		digits.length >= 10 &&
		!cleanLink.includes(".com") &&
		!cleanLink.includes("/");

	if (lower.includes("facebook")) Icon = FacebookIcon;
	else if (lower.includes("instagram") || lower.includes("ig"))
		Icon = InstagramIcon;
	else if (lower.includes("twitter") || lower.includes("x.com")) Icon = XIcon;
	else if (lower.includes("youtube") || lower.includes("youtu.be"))
		Icon = YouTubeIcon;
	else if (lower.includes("tiktok"))
		Icon = TikTokIcon; // 👈 ¡Aquí detectamos TikTok!
	else if (
		lower.includes("whatsapp") ||
		lower.includes("wa.me") ||
		isJustNumber
	) {
		Icon = WhatsAppIcon;
		// Si solo pusieron el número, armamos el link de WhatsApp automáticamente
		if (
			isJustNumber &&
			!lower.includes("wa.me") &&
			!lower.includes("whatsapp.com")
		) {
			href = `https://wa.me/${digits}`;
		}
	}

	if (!href.startsWith("http") && href.includes(".com")) {
		href = `https://${href}`;
	}

	return (
		<Tooltip title={cleanLink} arrow placement="top">
			<IconButton
				component="a"
				href={href}
				target="_blank"
				rel="noopener noreferrer"
				sx={{
					color: "inherit",
					opacity: 0.85,
					"&:hover": {
						opacity: 1,
						backgroundColor: "rgba(255,255,255,0.1)",
					},
				}}
			>
				<Icon />
			</IconButton>
		</Tooltip>
	);
}

export function PublicFooter({
	footerDescription,
	contactInfo,
	socialMediaInfo,
	hashtag,
}: {
	footerDescription?: string | null;
	contactInfo?: string | null;
	socialMediaInfo?: string | null;
	hashtag?: string | null;
}) {
	const contacts = contactInfo
		? contactInfo
				.split("\n")
				.map((c) => c.trim())
				.filter(Boolean)
		: ["soporte@eventplanner.local"];

	const socials = socialMediaInfo
		? socialMediaInfo
				.split("\n")
				.map((s) => s.trim())
				.filter(Boolean)
		: [];

	return (
		<footer className="footer">
			<div className="footer-grid">
				<div>
					<h4 style={{ fontSize: "1.4rem", fontWeight: 950 }}>
						Acerca del evento
					</h4>
					<p
						style={{
							marginTop: "0.75rem",
							maxWidth: 520,
							lineHeight: 1.6,
						}}
					>
						{footerDescription ||
							"Una página pública para registrar participantes, hecha con amor y orden por Konevx."}
					</p>
				</div>

				<div>
					<h5 style={{ fontWeight: 900, marginBottom: "0.75rem" }}>
						Contacto
					</h5>
					{contacts.map((contact, index) => {
						const cleanContact = contact
							.replace(/[\u200E\u200F\u202A-\u202E]/g, "")
							.trim();
						const digits = cleanContact.replace(/\D/g, "");
						const isPhone =
							digits.length >= 10 && !cleanContact.includes("@");

						return (
							<div key={index} style={{ marginBottom: "0.5rem" }}>
								{isPhone ? (
									<a
										href={`https://wa.me/${digits}`}
										target="_blank"
										rel="noopener noreferrer"
										style={{
											color: "inherit",
											textDecoration: "none",
											display: "inline-flex",
											alignItems: "center",
											gap: "0.4rem",
											opacity: 0.85,
										}}
										onMouseEnter={(e) =>
											(e.currentTarget.style.opacity =
												"1")
										}
										onMouseLeave={(e) =>
											(e.currentTarget.style.opacity =
												"0.85")
										}
									>
										<WhatsAppIcon
											sx={{
												color: "#25d366",
												fontSize: "1.2rem",
											}}
										/>
										<span style={{ fontWeight: 600 }}>
											{cleanContact}
										</span>
									</a>
								) : (
									<p style={{ margin: 0, opacity: 0.85 }}>
										{cleanContact}
									</p>
								)}
							</div>
						);
					})}
				</div>

				{socials.length > 0 && (
					<div>
						<h5
							style={{ fontWeight: 900, marginBottom: "0.75rem" }}
						>
							Redes
						</h5>
						<div
							style={{
								display: "flex",
								gap: "0.5rem",
								marginLeft: "-8px",
							}}
						>
							{socials.map((social, index) => (
								<SocialIconItem key={index} linkText={social} />
							))}
						</div>
					</div>
				)}
			</div>

			<div className="footer-bottom">
				© {new Date().getFullYear()}
				{hashtag && (
					<>
						{" "}
						•{" "}
						<span
							style={{ color: "var(--orange)", fontWeight: 900 }}
						>
							#{hashtag.toUpperCase()}
						</span>
					</>
				)}{" "}
				• Creado con Konevx
			</div>
		</footer>
	);
}
