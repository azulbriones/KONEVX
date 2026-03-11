import { Alert, Snackbar } from "@mui/material";
import { createContext, ReactNode, useContext, useState } from "react";

type NotificationType = "success" | "error" | "info" | "warning";

interface NotificationContextType {
	showNotification: (message: string, type?: NotificationType) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
	undefined,
);

export function NotificationProvider({ children }: { children: ReactNode }) {
	const [open, setOpen] = useState(false);
	const [message, setMessage] = useState("");
	const [type, setType] = useState<NotificationType>("success");

	const showNotification = (msg: string, t: NotificationType = "success") => {
		setMessage(msg);
		setType(t);
		setOpen(true);
	};

	const handleClose = () => setOpen(false);

	return (
		<NotificationContext.Provider value={{ showNotification }}>
			{children}
			<Snackbar
				open={open}
				autoHideDuration={4000}
				onClose={handleClose}
				anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
			>
				<Alert
					onClose={handleClose}
					severity={type}
					variant="filled"
					sx={{ width: "100%", borderRadius: 2 }}
				>
					{message}
				</Alert>
			</Snackbar>
		</NotificationContext.Provider>
	);
}

export const useNotification = () => {
	const context = useContext(NotificationContext);
	if (!context)
		throw new Error(
			"useNotification debe usarse dentro de NotificationProvider",
		);
	return context;
};
