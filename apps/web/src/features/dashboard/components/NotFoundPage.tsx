import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import WrongLocationIcon from "@mui/icons-material/WrongLocation";
import { useNavigate } from "react-router-dom";
import "./../styles/not_found.css";

export function NotFoundPage() {
	const navigate = useNavigate();

	return (
		<div className="main-bg">
			<div className="not-found-container">
				<WrongLocationIcon
					className="error-icon"
					sx={{ fontSize: 80 }}
				/>

				<h1 className="error-code">404</h1>

				<h2>¡Ups! Te has perdido</h2>
				<p className="subtitle">
					La página que buscas para tu evento no existe, ha sido
					movida o te han dado un enlace incorrecto.
				</p>

				<button className="btn-submit" onClick={() => navigate(-1)}>
					<ArrowBackIcon fontSize="small" />
					Volver atrás
				</button>
			</div>
		</div>
	);
}
