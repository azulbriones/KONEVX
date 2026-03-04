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
import { useLocation, useNavigate } from "react-router-dom";
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
			navigate(from, { replace: true });
		}
	}, [isUserLoading, user, navigate, from]);

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
				navigate(from, { replace: true });
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
					style={{ width: "100%" }}
				>
					<div className="input-group">
						<div className="input-wrapper">
							<EmailIcon className="icon-left" />
							<input
								type="email"
								placeholder="Correo Electrónico"
								autoComplete="email"
								disabled={loginMutation.isPending}
								{...register("email")}
								style={
									errors.email
										? { borderColor: "#ef4444" }
										: {}
								}
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
								autoComplete="current-password"
								disabled={loginMutation.isPending}
								{...register("password")}
								style={
									errors.password
										? { borderColor: "#ef4444" }
										: {}
								}
							/>
							<button
								type="button"
								className="toggle-password"
								onClick={() => setShowPassword((prev) => !prev)}
								tabIndex={-1}
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

					<a
						href="#"
						className="forgot-pass"
						style={{
							display: "block",
							textAlign: "right",
							fontSize: "13px",
							color: "#ea580c",
							textDecoration: "none",
							marginTop: "-10px",
							marginBottom: "20px",
							fontWeight: 600,
						}}
					>
						¿Olvidaste tu contraseña?
					</a>

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
				</form>
			</div>
		</div>
	);
}
