import {
	createBrowserRouter,
	Navigate,
	RouterProvider,
} from "react-router-dom";

// Layouts
import { EventLayout } from "@/features/events/layouts/EventLayout";
import { ProtectedRoute } from "./ProtectedRoute";

// Pages
import { MainLayout } from "@/components/layout/MainLayout";
import { LoginPage } from "@/features/auth/pages/LoginPage";
import { RegisterPage } from "@/features/auth/pages/RegisterPage";
import { DashboardPage } from "@/features/dashboard/components/DashboardPage";
import { NotFoundPage } from "@/features/dashboard/components/NotFoundPage";
import { CreateEventPage } from "@/features/events/pages/CreateEventPage";
import { EditEventPage } from "@/features/events/pages/EditEventPage";
import { EventFieldsPage } from "@/features/events/pages/EventFieldsPage";
import { EventMembersPage } from "@/features/events/pages/EventMembersPage";
import { EventOverviewPage } from "@/features/events/pages/EventOverviewPage";
import { EventRegistrationsPage } from "@/features/events/pages/EventRegistrationsPage";
import { PublicEventPage } from "@/features/public/pages/PublicEventPage";

const router = createBrowserRouter([
	{
		path: "/e/:slug",
		element: <PublicEventPage />,
	},
	{
		path: "/login",
		element: <LoginPage />,
	},
	{
		path: "/register",
		element: <RegisterPage />,
	},
	{
		element: <ProtectedRoute />,
		children: [
			{
				path: "/",
				element: <MainLayout />,
				children: [
					{ index: true, element: <DashboardPage /> },
					{ path: "events/new", element: <CreateEventPage /> },
					{
						path: "/events/:eventId",
						element: <EventLayout />,
						children: [
							{
								index: true,
								element: <Navigate to="overview" replace />,
							},
							{
								path: "overview",
								element: <EventOverviewPage />,
							},
							{
								path: "edit",
								element: <EditEventPage />,
							},
							{
								path: "registrations",
								element: <EventRegistrationsPage />,
							},
							{ path: "fields", element: <EventFieldsPage /> },
							{ path: "members", element: <EventMembersPage /> },
						],
					},
				],
			},
		],
	},

	{ path: "*", element: <NotFoundPage /> },
]);

export function AppRouter() {
	return <RouterProvider router={router} />;
}
