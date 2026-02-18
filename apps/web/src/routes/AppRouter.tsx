import { MainLayout } from "@/components/layout/MainLayout";
import { LoginPage } from "@/features/auth/components/LoginPage";
import { DashboardPage } from "@/features/dashboard/components/DashboardPage";
import { NotFoundPage } from "@/features/dashboard/components/NotFoundPage";
import { CreateEventPage } from "@/features/events/pages/CreateEventPage";
import { EventFieldsPage } from "@/features/events/pages/EventFieldsPage";
import { EventMembersPage } from "@/features/events/pages/EventMembersPage";
import { EventPage } from "@/features/events/pages/EventPage";
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

					{ path: "/events/:eventId", element: <EventPage /> },
					{
						path: "/events/:eventId/registrations",
						element: <EventRegistrationsPage />,
					},
					{
						path: "/events/:eventId/fields",
						element: <EventFieldsPage />,
					},
					{
						path: "/events/:eventId/members",
						element: <EventMembersPage />,
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
