import { useLogin } from "@/features/auth/hooks/useAuth";
import { getErrorMessage } from "@/features/utils/getErrorMessage";
import { yupResolver } from "@hookform/resolvers/yup";
import LockIcon from "@mui/icons-material/Lock";
import PersonIcon from "@mui/icons-material/Person";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { AuthFormShell } from "./AuthFormShell";
import { loginSchema, type LoginFormValues } from "../utils/validationSchema";

type Props = {
  toggleMode: () => void;
};

export const LoginForm = ({ toggleMode }: Props) => {
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
  }, [watch, loginMutation.isError, loginMutation.reset]);

  const onSubmit = (values: LoginFormValues) => {
    loginMutation.mutate(values, {
      onSuccess: () => navigate("/", { replace: true }),
    });
  };

  return (
    <AuthFormShell
      label="Acceso"
      title="Bienvenido de nuevo"
      description="Ingresa para gestionar tus eventos con una experiencia más clara y rápida."
      error={
        loginMutation.isError ? getErrorMessage(loginMutation.error) : null
      }
      footerText="¿No tienes cuenta?"
      footerActionLabel="Regístrate aquí"
      onFooterAction={toggleMode}
      onSubmit={handleSubmit(onSubmit)}
      isPending={loginMutation.isPending}
      submitLabel="Iniciar Sesión"
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
          <span className="error-text">{errors.identifier.message}</span>
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
            {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
          </button>
        </div>
        {errors.password && (
          <span className="error-text">{errors.password.message}</span>
        )}
      </div>
    </AuthFormShell>
  );
};
