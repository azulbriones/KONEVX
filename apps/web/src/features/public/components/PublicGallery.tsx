import { env } from "@/config/env";
import CameraAltIcon from "@mui/icons-material/CameraAlt";
import { useEffect, useRef } from "react";

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
	const videoRef = useRef<HTMLVideoElement>(null);

	useEffect(() => {
		const videoElement = videoRef.current;
		if (!videoElement) return;

		const observer = new IntersectionObserver(
			(entries) => {
				const [entry] = entries;
				if (entry.isIntersecting) {
					videoElement.play().catch(() => {});
				} else {
					videoElement.pause();
				}
			},
			{ threshold: 0.2 },
		);

		observer.observe(videoElement);

		return () => {
			observer.unobserve(videoElement);
		};
	}, []);

	const getMediaUrl = (
		path: string | undefined | null,
		fallbackIndex: number,
	) => {
		if (!path) return FALLBACK_IMAGES[fallbackIndex];
		return `${env.API_BASE_URL}${path}`;
	};

	const images = promotionalImages || [];

	return (
		<section id="info" className="section">
			<div className="section-title">
				<CameraAltIcon htmlColor="var(--primary)" />
				<h2>Vive la experiencia</h2>
			</div>

			<div className="bento">
				{/* --- ITEM PRINCIPAL (Video o Foto Destacada) --- */}
				<div className="bento-item bento-main">
					{promotionalVideo ? (
						<video
							ref={videoRef}
							src={getMediaUrl(promotionalVideo, 0)}
							muted
							loop
							playsInline
							controls
							style={{
								width: "100%",
								height: "100%",
								objectFit: "cover",
								display: "block",
							}}
						/>
					) : (
						<>
							<div
								className="bento-overlay"
								style={{
									background:
										"linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 60%)",
								}}
							></div>
							<img
								alt="Galería principal"
								src={getMediaUrl(images[0], 0)}
								style={{
									width: "100%",
									height: "100%",
									objectFit: "cover",
									display: "block",
								}}
							/>
							<div className="bento-caption">
								<small>Foto destacada</small>
								<h3>Un encuentro que recordarás</h3>
							</div>
						</>
					)}
				</div>

				{/* --- ITEMS LATERALES (Stack y Minis) --- */}
				<div className="bento-side">
					<div className="bento-item">
						<img
							alt="Actividad 1"
							src={getMediaUrl(images[1], 1)}
							style={{
								width: "100%",
								height: "100%",
								objectFit: "cover",
								display: "block",
							}}
						/>
					</div>

					<div className="bento-mini">
						<div className="bento-item">
							<img
								alt="Actividad 2"
								src={getMediaUrl(images[2], 2)}
								style={{
									width: "100%",
									height: "100%",
									objectFit: "cover",
									display: "block",
								}}
							/>
						</div>
						<div className="bento-item">
							<img
								alt="Actividad 3"
								src={getMediaUrl(images[3], 3)}
								style={{
									width: "100%",
									height: "100%",
									objectFit: "cover",
									display: "block",
								}}
							/>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
