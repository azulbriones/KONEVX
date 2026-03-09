import CameraAltIcon from "@mui/icons-material/CameraAlt";
import MusicNoteIcon from "@mui/icons-material/MusicNote";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

const FALLBACK_IMAGES = [
	"https://images.unsplash.com/photo-1523580494863-6f3031224c94?auto=format&fit=crop&q=80&w=1400",
	"https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&q=80&w=900",
	"https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&q=80&w=900",
	"https://images.unsplash.com/photo-1544928147-79a2dbc1f389?auto=format&fit=crop&q=80&w=900",
];

export function PublicGallery({
	promotionalVideo,
	promotionalImages,
}: {
	promotionalVideo?: string | null;
	promotionalImages?: string[] | null;
}) {
	const getMediaUrl = (
		path: string | undefined | null,
		fallbackIndex: number,
	) => {
		if (!path) return FALLBACK_IMAGES[fallbackIndex];
		return `${API_URL}${path}`;
	};

	const images = promotionalImages || [];

	return (
		<section id="info" className="section">
			<div className="section-title">
				<CameraAltIcon htmlColor="#2563eb" />
				<h2>Vive la experiencia</h2>
			</div>

			<div className="bento">
				<div className="bento-item bento-main">
					{promotionalVideo ? (
						<video
							src={getMediaUrl(promotionalVideo, 0)}
							controls
							style={{
								width: "100%",
								height: "100%",
								objectFit: "cover",
								position: "absolute",
								top: 0,
								left: 0,
							}}
						/>
					) : (
						<>
							<div className="bento-overlay">
								<div className="play">
									<MusicNoteIcon />
								</div>
							</div>
							<img
								alt="Galería principal"
								src={getMediaUrl(images[0], 0)}
							/>
						</>
					)}

					{!promotionalVideo && (
						<div className="bento-caption">
							<small>Video / Foto destacada</small>
							<h3>Un encuentro que recordarás</h3>
						</div>
					)}
				</div>

				<div className="bento-side">
					<div className="bento-item">
						<img
							alt="Actividad 1"
							src={getMediaUrl(
								promotionalVideo ? images[0] : images[1],
								1,
							)}
						/>
					</div>

					<div className="bento-mini">
						<div className="bento-item">
							<img
								alt="Actividad 2"
								src={getMediaUrl(
									promotionalVideo ? images[1] : images[2],
									2,
								)}
							/>
						</div>
						<div className="bento-item">
							<img
								alt="Actividad 3"
								src={getMediaUrl(
									promotionalVideo ? images[2] : images[3],
									3,
								)}
							/>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
