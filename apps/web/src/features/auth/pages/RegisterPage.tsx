import { useNotification } from "@/components/ui/NotificationContext";
import { useRegister, useUser } from "@/features/auth/hooks/useAuth";
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

export function RegisterPage() {
	const navigate = useNavigate();
	const location = useLocation();
	const { showNotification } = useNotification();
	const [showPassword, setShowPassword] = useState(false);

	const from = (location.state as any)?.from?.pathname || "/";

	const { data: user, isLoading: isUserLoading } = useUser();
	const registerMutation = useRegister();

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
			if (registerMutation.isError) {
				registerMutation.reset();
			}
		});
		return () => subscription.unsubscribe();
	}, [watch, registerMutation]);

	const onSubmit = (values: FormValues) => {
		registerMutation.mutate(values, {
			onSuccess: () => {
				showNotification(
					"Cuenta creada con éxito. Ahora puedes iniciar sesión.",
					"success",
				);
				navigate("/login", { replace: true });
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
				<h2>Crear Cuenta</h2>
				<p className="subtitle">Únete para colaborar en eventos</p>

				{registerMutation.isError && (
					<Alert severity="error" sx={{ width: "100%", mb: 2 }}>
						{getErrorMessage(registerMutation.error)}
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
								disabled={registerMutation.isPending}
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
								autoComplete="new-password"
								disabled={registerMutation.isPending}
								className={errors.password ? "input-error" : ""}
								{...register("password")}
							/>
							<button
								type="button"
								className="toggle-password"
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
						disabled={registerMutation.isPending}
					>
						{registerMutation.isPending && (
							<CircularProgress
								size={20}
								color="inherit"
								sx={{ mr: 1 }}
							/>
						)}
						{registerMutation.isPending
							? "Creando cuenta..."
							: "Registrarse"}
					</button>

					<div style={{ textAlign: "center", marginTop: "1rem" }}>
						<span style={{ color: "#64748b", fontSize: "0.9rem" }}>
							¿Ya tienes cuenta?{" "}
							<Link
								to="/login"
								style={{
									color: "#ea580c",
									textDecoration: "none",
									fontWeight: 600,
								}}
							>
								Inicia sesión
							</Link>
						</span>
					</div>
				</form>
			</div>
		</div>
	);
}
