export function PublicFooter() {
	return (
		<footer className="footer">
			<div className="footer-grid">
				<div>
					<h4 style={{ fontSize: "1.4rem", fontWeight: 950 }}>
						EventPlanner
					</h4>
					<p style={{ marginTop: "0.75rem", maxWidth: 520 }}>
						Una página pública para registrar participantes, hecha
						con amor y orden.
					</p>
				</div>

				<div>
					<h5 style={{ fontWeight: 900, marginBottom: "0.75rem" }}>
						Contacto
					</h5>
					<p>Soporte: soporte@eventplanner.local</p>
				</div>

				<div>
					<h5 style={{ fontWeight: 900, marginBottom: "0.75rem" }}>
						Redes
					</h5>
					<p style={{ opacity: 0.85 }}>Próximamente</p>
				</div>
			</div>

			<div className="footer-bottom">© 2026 • EventPlanner</div>
		</footer>
	);
}
