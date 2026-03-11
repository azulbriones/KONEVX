import BarChartIcon from "@mui/icons-material/BarChart";
import DashboardIcon from "@mui/icons-material/Dashboard";
import EventIcon from "@mui/icons-material/Event";
import PeopleIcon from "@mui/icons-material/People";

export const MenuItems = [
	{
		id: "dashboard",
		label: "Resumen",
		icon: DashboardIcon,
		path: "/",
	},
	{
		id: "events",
		label: "Mis Eventos",
		icon: EventIcon,
		path: "events",
	},
	{
		id: "participants",
		label: "Participantes",
		icon: PeopleIcon,
		path: "participants",
		gate: (a: any) => a?.canRead,
	},
	{
		id: "reports",
		label: "Reportes",
		icon: BarChartIcon,
		path: "reports",
		gate: (a: any) => a?.canRead,
	},
];

