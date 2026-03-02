import CameraAltIcon from "@mui/icons-material/CameraAlt";
import MusicNoteIcon from "@mui/icons-material/MusicNote";

export function PublicGallery() {
	return (
		<section id="info" className="section">
			<div className="section-title">
				<CameraAltIcon htmlColor="#2563eb" />
				<h2>Vive la experiencia</h2>
			</div>

			<div className="bento">
				<div className="bento-item bento-main">
					<div className="bento-overlay">
						<div className="play">
							<MusicNoteIcon />
						</div>
					</div>

					<img
						alt="Galería principal"
						src="https://images.unsplash.com/photo-1523580494863-6f3031224c94?auto=format&fit=crop&q=80&w=1400"
					/>

					<div className="bento-caption">
						<small>Video / Foto destacada</small>
						<h3>Un encuentro que recordarás</h3>
					</div>
				</div>

				<div className="bento-side">
					<div className="bento-item">
						<img
							alt="Actividad 1"
							src="https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&q=80&w=900"
						/>
					</div>

					<div className="bento-mini">
						<div className="bento-item">
							<img
								alt="Actividad 2"
								src="https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&q=80&w=900"
							/>
						</div>
						<div className="bento-item">
							<img
								alt="Actividad 3"
								src="https://images.unsplash.com/photo-1544928147-79a2dbc1f389?auto=format&fit=crop&q=80&w=900"
							/>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
