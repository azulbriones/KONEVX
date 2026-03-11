import { useLogin, useUser } from "@/features/auth/hooks/useAuth";
import { getErrorMessage } from "@/features/utils/getErrorMessage";
import { yupResolver } from "@hookform/resolvers/yup";
import EmailIcon from "@mui/icons-material/Email";
import LockIcon from "@mui/icons-material/Lock";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import { Alert, Box, CircularProgress } from "@mui/material";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useLocation, useNavigate } from "react-router-dom";
import type { FormValues } from "../types";
import { schema } from "../utils/validationSchema";
import "./../styles/general_auth.css";

export function LoginPage() {
	const navigate = useNavigate();
	const location = useLocation();
	const [showPassword, setShowPassword] = useState(false);

	const from = (location.state as any)?.from?.pathname || "/";

	const { data: user, isLoading: isUserLoading } = useUser();
	const loginMutation = useLogin();

	const {
		register,
		handleSubmit,
		formState: { errors },
		watch,
	} = useForm<FormValues>({
		resolver: yupResolver(schema),
		defaultValues: { email: "", password: "" },
	});

	useEffect(() => {
		if (!isUserLoading && user) {
			navigate("/", { replace: true });
		}
	}, [isUserLoading, user, navigate]);

	useEffect(() => {
		const subscription = watch(() => {
			if (loginMutation.isError) {
				loginMutation.reset();
			}
		});
		return () => subscription.unsubscribe();
	}, [watch, loginMutation]);

	const onSubmit = (values: FormValues) => {
		loginMutation.mutate(values, {
			onSuccess: () => {
				navigate("/", { replace: true });
			},
		});
	};

	if (isUserLoading) {
		return (
			<Box
				sx={{
					minHeight: "100vh",
					display: "grid",
					placeItems: "center",
				}}
			>
				<CircularProgress />
			</Box>
		);
	}

	if (user) return null;

	return (
		<div className="main-bg">
			<div className="auth-card-container">
				<h2>Panel de Eventos</h2>
				<p className="subtitle">Gestiona tus eventos de forma fácil</p>

				{loginMutation.isError && (
					<Alert severity="error" sx={{ width: "100%", mb: 2 }}>
						{getErrorMessage(loginMutation.error)}
					</Alert>
				)}

				<form
					onSubmit={handleSubmit(onSubmit)}
					noValidate
					className="auth-form"
				>
					<div className="input-group">
						<div className="input-wrapper">
							<EmailIcon className="icon-left" />
							<input
								type="email"
								placeholder="Correo Electrónico"
								aria-label="Correo Electrónico"
								autoComplete="email"
								disabled={loginMutation.isPending}
								className={errors.email ? "input-error" : ""}
								{...register("email")}
							/>
						</div>
						{errors.email && (
							<span className="error-text">
								{errors.email.message}
							</span>
						)}
					</div>

					<div className="input-group">
						<div className="input-wrapper">
							<LockIcon className="icon-left" />
							<input
								type={showPassword ? "text" : "password"}
								placeholder="Contraseña"
								aria-label="Contraseña"
								autoComplete="current-password"
								disabled={loginMutation.isPending}
								className={errors.password ? "input-error" : ""}
								{...register("password")}
							/>
							<button
								type="button"
								className="toggle-password"
								aria-label={
									showPassword
										? "Ocultar contraseña"
										: "Mostrar contraseña"
								}
								onClick={() => setShowPassword((prev) => !prev)}
							>
								{showPassword ? (
									<VisibilityOffIcon />
								) : (
									<VisibilityIcon />
								)}
							</button>
						</div>
						{errors.password && (
							<span className="error-text">
								{errors.password.message}
							</span>
						)}
					</div>

					<button
						type="submit"
						className="btn-submit"
						disabled={loginMutation.isPending}
					>
						{loginMutation.isPending && (
							<CircularProgress size={20} color="inherit" />
						)}
						{loginMutation.isPending
							? "Ingresando..."
							: "Iniciar Sesión"}
					</button>
					<div style={{ textAlign: "center", marginTop: "1rem" }}>
						<span style={{ color: "#64748b", fontSize: "0.9rem" }}>
							¿No tienes cuenta?{" "}
							<Link
								to="/register"
								style={{
									color: "#ea580c",
									fontWeight: 600,
								}}
							>
								Regístrate aquí
							</Link>
						</span>
					</div>
				</form>
			</div>
		</div>
	);
}
