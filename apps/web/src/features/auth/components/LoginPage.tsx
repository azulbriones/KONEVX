import { yupResolver } from "@hookform/resolvers/yup";
import { LockOutlined, Visibility, VisibilityOff } from "@mui/icons-material";
import {
	Alert,
	Box,
	Button,
	CircularProgress,
	IconButton,
	InputAdornment,
	Paper,
	Stack,
	TextField,
	Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useLocation, useNavigate } from "react-router-dom";

// Hooks y Utilidades
import { useLogin, useUser } from "@/features/auth/hooks/useAuth";
import { getErrorMessage } from "@/features/utils/getErrorMessage"; // Asumo que moviste esto aquí
import type { FormValues } from "../types";
import { schema } from "../utils/validationSchema";

export function LoginPage() {
	const navigate = useNavigate();
	const location = useLocation();
	const [showPassword, setShowPassword] = useState(false);

	// Recuperar ruta anterior o ir al Dashboard por defecto
	const from = (location.state as any)?.from?.pathname || "/";

	// Hooks de Auth
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

	// 1. Redirección si ya hay sesión (Protección)
	useEffect(() => {
		if (!isUserLoading && user) {
			navigate(from, { replace: true });
		}
	}, [isUserLoading, user, navigate, from]);

	// 2. UX: Limpiar errores al escribir
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
				// La navegación ocurre aquí para asegurar que tenemos el token listo
				navigate(from, { replace: true });
			},
		});
	};

	// Spinner de carga inicial (Verificando sesión)
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

	// Evita renderizar el form si ya te estás yendo
	if (user) return null;

	return (
		<Box
			sx={{
				minHeight: "100vh",
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
				bgcolor: "background.default",
				p: 2,
			}}
		>
			<Paper
				elevation={3}
				sx={{
					width: "100%",
					maxWidth: 400,
					p: 4,
					borderRadius: 3,
					display: "flex",
					flexDirection: "column",
					alignItems: "center",
				}}
			>
				<Box
					sx={{
						mb: 2,
						p: 1.5,
						bgcolor: "primary.light",
						borderRadius: "50%",
						color: "primary.main",
					}}
				>
					<LockOutlined />
				</Box>

				<Typography variant="h5" fontWeight={700} gutterBottom>
					Bienvenido
				</Typography>

				<Typography variant="body2" color="text.secondary" mb={3}>
					Ingresa tus credenciales para continuar
				</Typography>

				{/* Mensaje de Error */}
				{loginMutation.isError && (
					<Alert severity="error" sx={{ width: "100%", mb: 2 }}>
						{getErrorMessage(loginMutation.error)}
					</Alert>
				)}

				<Box
					component="form"
					onSubmit={handleSubmit(onSubmit)}
					noValidate
					sx={{ width: "100%" }}
				>
					<Stack spacing={2.5}>
						<TextField
							label="Correo Electrónico"
							type="email"
							autoComplete="email"
							{...register("email")}
							error={!!errors.email}
							helperText={errors.email?.message}
							fullWidth
							disabled={loginMutation.isPending}
						/>

						<TextField
							label="Contraseña"
							type={showPassword ? "text" : "password"}
							autoComplete="current-password"
							{...register("password")}
							error={!!errors.password}
							helperText={errors.password?.message}
							fullWidth
							disabled={loginMutation.isPending}
							InputProps={{
								endAdornment: (
									<InputAdornment position="end">
										<IconButton
											/* 👇 CORRECCIÓN CRÍTICA: type="button" para no enviar el form */
											type="button"
											onClick={() =>
												setShowPassword((prev) => !prev)
											}
											edge="end"
										>
											{showPassword ? (
												<VisibilityOff />
											) : (
												<Visibility />
											)}
										</IconButton>
									</InputAdornment>
								),
							}}
						/>

						<Button
							type="submit"
							variant="contained"
							size="large"
							disabled={loginMutation.isPending}
							fullWidth
							startIcon={
								loginMutation.isPending ? (
									<CircularProgress
										size={20}
										color="inherit"
									/>
								) : null
							}
						>
							{loginMutation.isPending
								? "Ingresando..."
								: "Iniciar Sesión"}
						</Button>
					</Stack>
				</Box>
			</Paper>

			<Box sx={{ position: "absolute", bottom: 20, px: 2, opacity: 0.7 }}>
				<Typography
					variant="caption"
					color="text.secondary"
					align="center"
					display="block"
				>
					&copy; {new Date().getFullYear()} EventPlanner
				</Typography>
			</Box>
		</Box>
	);
}
