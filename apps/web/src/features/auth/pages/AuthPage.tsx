import { Box, CircularProgress } from "@mui/material";
import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useUser } from "@/features/auth/hooks/useAuth";
import { LoginForm } from "../components/LoginForm";
import { RegisterForm } from "../components/RegisterForm";
import "./../styles/general_auth.css";

export const AuthPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const from =
    (location.state as { from?: { pathname?: string } } | null)?.from
      ?.pathname || "/";
  const isLoginMode = !location.pathname.includes("register");
  const { data: user, isLoading: isUserLoading } = useUser();

  useEffect(() => {
    if (!isUserLoading && user) navigate(from, { replace: true });
  }, [from, isUserLoading, navigate, user]);

  const toggleMode = () => {
    navigate(isLoginMode ? "/register" : "/login", { replace: true });
  };

  if (isUserLoading) {
    return (
      <Box className="auth-loading-screen">
        <CircularProgress color="primary" />
      </Box>
    );
  }

  if (user) return null;

  return (
    <div className="auth-split-layout">
      <div className="auth-cover">
        <div className="auth-cover-overlay">
          <div className="auth-cover-text">
            <div className="auth-brand-pill">Konevx</div>
            <h1>Gestiona eventos</h1>
            <p>Registros, accesos y logística en un solo lugar.</p>
          </div>
        </div>
      </div>
      <div className="auth-panel">
        <div className="auth-form-container">
          {isLoginMode ? (
            <LoginForm toggleMode={toggleMode} />
          ) : (
            <RegisterForm toggleMode={toggleMode} />
          )}
        </div>
      </div>
    </div>
  );
};
