import { MainLayout } from "@/components/layout/MainLayout";
import { LoginPage } from "@/features/auth/components/LoginPage";
import { DashboardPage } from "@/features/dashboard/components/DasboardPage";
import { NotFoundPage } from "@/features/dashboard/components/NotFoundPage";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { ProtectedRoute } from "./ProtectedRoute";

const router = createBrowserRouter([
	{
		path: "/login",
		element: <LoginPage />,
	},

	{
		element: <ProtectedRoute />,
		children: [
			{
				element: <MainLayout />,
				children: [
					{
						path: "/",
						element: <DashboardPage />,
					},
				],
			},
		],
	},

	{
		path: "*",
		element: <NotFoundPage />,
	},
]);

export function AppRouter() {
	return <RouterProvider router={router} />;
}
