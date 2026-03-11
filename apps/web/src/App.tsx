import { AppRouter } from "@/routes/AppRouter";
import { NotificationProvider } from "./components/ui/NotificationContext";

export default function App() {
	return (
		<NotificationProvider>
			<AppRouter />
		</NotificationProvider>
	);
}
