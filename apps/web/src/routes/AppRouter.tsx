import { MainLayout } from "@/components/layout/MainLayout";
import { LoginPage } from "@/features/auth/components/LoginPage";
import { DashboardPage } from "@/features/dashboard/components/DashboardPage";
import { NotFoundPage } from "@/features/dashboard/components/NotFoundPage";
import { EventLayout } from "@/features/events/layouts/EventLayout";
import { CreateEventPage } from "@/features/events/pages/CreateEventPage";
import { EventFieldsPage } from "@/features/events/pages/EventFieldsPage";
import { EventMembersPage } from "@/features/events/pages/EventMembersPage";
import { EventOverviewPage } from "@/features/events/pages/EventOverviewPage";
import { EventRegistrationsPage } from "@/features/events/pages/EventRegistrationsPage";
import {
	createBrowserRouter,
	Navigate,
	RouterProvider,
} from "react-router-dom";
import { ProtectedRoute } from "./ProtectedRoute";

const router = createBrowserRouter([
	{ path: "/login", element: <LoginPage /> },

	{
		element: <ProtectedRoute />,
		children: [
			{
				element: <MainLayout />,
				children: [
					{ path: "/", element: <DashboardPage /> },

					{ path: "/events/new", element: <CreateEventPage /> },

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
								path: "registrations",
								element: <EventRegistrationsPage />,
							},
							{ path: "fields", element: <EventFieldsPage /> },
							{ path: "members", element: <EventMembersPage /> },
						],
					},

					{ path: "/events", element: <Navigate to="/" replace /> },
				],
			},
		],
	},

	{ path: "*", element: <NotFoundPage /> },
]);

export function AppRouter() {
	return <RouterProvider router={router} />;
}
