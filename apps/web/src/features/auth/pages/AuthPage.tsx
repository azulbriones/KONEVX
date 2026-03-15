import { useNotification } from "@/components/ui/NotificationContext";
import { useLogin, useRegister, useUser } from "@/features/auth/hooks/useAuth";
import { getErrorMessage } from "@/features/utils/getErrorMessage";
import { yupResolver } from "@hookform/resolvers/yup";
import EmailIcon from "@mui/icons-material/Email";
import LockIcon from "@mui/icons-material/Lock";
import PersonIcon from "@mui/icons-material/Person";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import { Alert, Box, CircularProgress } from "@mui/material";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useLocation, useNavigate } from "react-router-dom";
import {
	loginSchema,
	registerSchema,
	type LoginFormValues,
	type RegisterFormValues,
} from "../utils/validationSchema";
import "./../styles/general_auth.css";

// ==========================================
// COMPONENTE: FORMULARIO DE LOGIN
// ==========================================
function LoginForm({ toggleMode }: { toggleMode: () => void }) {
	const navigate = useNavigate();
	const loginMutation = useLogin();
	const [showPassword, setShowPassword] = useState(false);

	const {
		register,
		handleSubmit,
		formState: { errors },
		watch,
	} = useForm<LoginFormValues>({
		resolver: yupResolver(loginSchema),
		defaultValues: { identifier: "", password: "" },
	});

	useEffect(() => {
		const sub = watch(() => {
			if (loginMutation.isError) loginMutation.reset();
		});
		return () => sub.unsubscribe();
	}, [watch, loginMutation]);

	const onSubmit = (values: LoginFormValues) => {
		loginMutation.mutate(values, {
			onSuccess: () => navigate("/", { replace: true }),
		});
	};

	return (
		<div className="form-fade-in">
			<div className="auth-header">
				<h2>Bienvenido de nuevo</h2>
				<p className="subtitle">Ingresa para gestionar tus eventos</p>
			</div>

			{loginMutation.isError && (
				<Alert
					severity="error"
					sx={{ width: "100%", mb: 3, borderRadius: "10px" }}
				>
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
						<PersonIcon className="icon-left" />
						<input
							type="text"
							placeholder="Usuario o Correo"
							disabled={loginMutation.isPending}
							className={errors.identifier ? "input-error" : ""}
							{...register("identifier")}
						/>
					</div>
					{errors.identifier && (
						<span className="error-text">
							{errors.identifier.message}
						</span>
					)}
				</div>

				<div className="input-group">
					<div className="input-wrapper">
						<LockIcon className="icon-left" />
						<input
							type={showPassword ? "text" : "password"}
							placeholder="Contraseña"
							disabled={loginMutation.isPending}
							className={errors.password ? "input-error" : ""}
							{...register("password")}
						/>
						<button
							type="button"
							className="toggle-password"
							onClick={() => setShowPassword(!showPassword)}
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
						<CircularProgress
							size={20}
							color="inherit"
							sx={{ mr: 1 }}
						/>
					)}
					{loginMutation.isPending
						? "Ingresando..."
						: "Iniciar Sesión"}
				</button>

				<div className="toggle-auth-mode">
					<span style={{ color: "#64748b" }}>
						¿No tienes cuenta?{" "}
					</span>
					<button
						type="button"
						onClick={toggleMode}
						className="btn-text"
					>
						Regístrate aquí
					</button>
				</div>
			</form>
		</div>
	);
}

// ==========================================
// COMPONENTE: FORMULARIO DE REGISTRO
// ==========================================
function RegisterForm({ toggleMode }: { toggleMode: () => void }) {
	const registerMutation = useRegister();
	const { showNotification } = useNotification();
	const [showPassword, setShowPassword] = useState(false);

	const {
		register,
		handleSubmit,
		formState: { errors },
		watch,
	} = useForm<RegisterFormValues>({
		resolver: yupResolver(registerSchema),
		defaultValues: { username: "", email: "", password: "" },
	});

	useEffect(() => {
		const sub = watch(() => {
			if (registerMutation.isError) registerMutation.reset();
		});
		return () => sub.unsubscribe();
	}, [watch, registerMutation]);

	const onSubmit = (values: RegisterFormValues) => {
		registerMutation.mutate(values, {
			onSuccess: () => {
				showNotification(
					"¡Cuenta creada! Ahora puedes iniciar sesión.",
					"success",
				);
				toggleMode();
			},
		});
	};

	return (
		<div className="form-fade-in">
			<div className="auth-header">
				<h2>Crear Cuenta</h2>
				<p className="subtitle">Únete para colaborar en la logística</p>
			</div>

			{registerMutation.isError && (
				<Alert
					severity="error"
					sx={{ width: "100%", mb: 3, borderRadius: "10px" }}
				>
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
						<PersonIcon className="icon-left" />
						<input
							type="text"
							placeholder="Nombre de Usuario"
							disabled={registerMutation.isPending}
							className={errors.username ? "input-error" : ""}
							{...register("username")}
						/>
					</div>
					{errors.username && (
						<span className="error-text">
							{errors.username.message}
						</span>
					)}
				</div>

				<div className="input-group">
					<div className="input-wrapper">
						<EmailIcon className="icon-left" />
						<input
							type="email"
							placeholder="Correo Electrónico"
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
							disabled={registerMutation.isPending}
							className={errors.password ? "input-error" : ""}
							{...register("password")}
						/>
						<button
							type="button"
							className="toggle-password"
							onClick={() => setShowPassword(!showPassword)}
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

				<div className="toggle-auth-mode">
					<span style={{ color: "#64748b" }}>
						¿Ya tienes cuenta?{" "}
					</span>
					<button
						type="button"
						onClick={toggleMode}
						className="btn-text"
					>
						Inicia sesión
					</button>
				</div>
			</form>
		</div>
	);
}

// ==========================================
// PÁGINA PRINCIPAL CONTENEDORA
// ==========================================
export function AuthPage() {
	const location = useLocation();
	const navigate = useNavigate();

	const [isLoginMode, setIsLoginMode] = useState(
		!location.pathname.includes("register"),
	);

	const { data: user, isLoading: isUserLoading } = useUser();
	const from = (location.state as any)?.from?.pathname || "/";

	useEffect(() => {
		if (!isUserLoading && user) navigate(from, { replace: true });
	}, [isUserLoading, user, navigate, from]);

	const toggleMode = () => {
		const newMode = !isLoginMode;
		setIsLoginMode(newMode);
		window.history.replaceState(null, "", newMode ? "/login" : "/register");
	};

	if (isUserLoading) {
		return (
			<Box
				sx={{
					minHeight: "100vh",
					display: "grid",
					placeItems: "center",
					bgcolor: "#0f172a",
				}}
			>
				<CircularProgress color="primary" />
			</Box>
		);
	}

	if (user) return null;

	return (
		<div className="auth-split-layout">
			{/* LADO IZQUIERDO: IMAGEN HERO */}
			<div className="auth-cover">
				<div className="auth-cover-overlay">
					<div className="auth-cover-text">
						<h1>Konevx Pro</h1>
						<p>
							Plataforma integral para la gestión, logística y
							control de accesos de tus eventos.
						</p>
					</div>
				</div>
			</div>

			{/* LADO DERECHO: PANEL DE FORMULARIO */}
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
}
