import CloseIcon from "@mui/icons-material/Close";
import { useEffect, useState } from "react";

type Props = {
	remaining: number;
};

const STORAGE_KEY = "public_event_capacity_banner_closed";

export function PublicCapacityBanner({ remaining }: Props) {
	const [visible, setVisible] = useState(false);

	useEffect(() => {
		if (remaining > 0) {
			setVisible(false);
			return;
		}

		const closed = sessionStorage.getItem(STORAGE_KEY);
		setVisible(!closed);
	}, [remaining]);

	if (remaining > 0 || !visible) return null;

	const handleClose = () => {
		sessionStorage.setItem(STORAGE_KEY, "1");
		setVisible(false);
	};

	return (
		<div
			role="status"
			aria-live="polite"
			style={{
				position: "sticky",
				top: 0,
				zIndex: 100,
				background: "#991b1b",
				color: "white",
				padding: "0.6rem 1rem",
				display: "flex",
				alignItems: "center",
				justifyContent: "space-between",
				fontWeight: 800,
				fontSize: "0.9rem",
				borderBottom: "1px solid rgba(255,255,255,0.15)",
			}}
		>
			<span>
				🔴 Cupo lleno — este evento ya no tiene lugares disponibles
			</span>

			<button
				onClick={handleClose}
				aria-label="Cerrar aviso"
				style={{
					background: "transparent",
					border: "none",
					color: "white",
					cursor: "pointer",
					display: "flex",
					alignItems: "center",
				}}
			>
				<CloseIcon fontSize="small" />
			</button>
		</div>
	);
}
