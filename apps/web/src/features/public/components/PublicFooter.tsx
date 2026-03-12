import FacebookIcon from "@mui/icons-material/Facebook";
import InstagramIcon from "@mui/icons-material/Instagram";
import LanguageIcon from "@mui/icons-material/Language";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import XIcon from "@mui/icons-material/X";
import YouTubeIcon from "@mui/icons-material/YouTube";
import { IconButton, Tooltip } from "@mui/material";

function SocialIconItem({ linkText }: { linkText: string }) {
	const lower = linkText.toLowerCase();
	let Icon = LanguageIcon;
	let href = linkText;

	if (lower.includes("facebook")) Icon = FacebookIcon;
	else if (lower.includes("instagram") || lower.includes("ig"))
		Icon = InstagramIcon;
	else if (lower.includes("twitter") || lower.includes("x.com")) Icon = XIcon;
	else if (lower.includes("youtube") || lower.includes("youtu.be"))
		Icon = YouTubeIcon;
	else if (lower.includes("whatsapp") || lower.includes("wa.me"))
		Icon = WhatsAppIcon;

	if (!href.startsWith("http") && href.includes(".com")) {
		href = `https://${href}`;
	}

	return (
		<Tooltip title={linkText} arrow placement="top">
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
					{contacts.map((contact, index) => (
						<p key={index} style={{ marginBottom: "0.3rem" }}>
							{contact}
						</p>
					))}
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
