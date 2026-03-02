import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";

export function PublicNav({ brand = "EventPlanner" }: { brand?: string }) {
	return (
		<nav className="public-nav">
			<div className="public-brand">
				<div className="public-logo">EP</div>
				<div className="public-brand-name">{brand}</div>
			</div>

			<a className="public-cta" href="#registro">
				Registrarme <ArrowDownwardIcon fontSize="small" />
			</a>
		</nav>
	);
}
