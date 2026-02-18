import { useUser } from "@/features/auth/hooks/useAuth";
import { Box, CircularProgress } from "@mui/material";
import { Navigate, Outlet, useLocation } from "react-router-dom";

export function ProtectedRoute() {
	const { data: user, isLoading, isError } = useUser();

	const location = useLocation();

	if (isLoading) {
		return (
			<Box
				sx={{
					display: "flex",
					justifyContent: "center",
					alignItems: "center",
					height: "100vh",
					bgcolor: "background.default",
				}}
			>
				<CircularProgress />
			</Box>
		);
	}

	if (isError || !user) {
		return <Navigate to="/login" replace state={{ from: location }} />;
	}

	return <Outlet />;
}
