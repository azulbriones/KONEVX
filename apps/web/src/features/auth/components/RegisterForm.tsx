import { useNotification } from "@/components/ui/NotificationContext";
import { useRegister } from "@/features/auth/hooks/useAuth";
import { getErrorMessage } from "@/features/utils/getErrorMessage";
import { yupResolver } from "@hookform/resolvers/yup";
import EmailIcon from "@mui/icons-material/Email";
import LockIcon from "@mui/icons-material/Lock";
import PersonIcon from "@mui/icons-material/Person";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { AuthFormShell } from "./AuthFormShell";
import {
  registerSchema,
  type RegisterFormValues,
} from "../utils/validationSchema";

type Props = {
  toggleMode: () => void;
};

export const RegisterForm = ({ toggleMode }: Props) => {
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
  }, [watch, registerMutation.isError, registerMutation.reset]);

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
    <AuthFormShell
      label="Registro"
      title="Crear cuenta"
      description="Únete para colaborar en la logística y gestión de eventos."
      error={
        registerMutation.isError
          ? getErrorMessage(registerMutation.error)
          : null
      }
      footerText="¿Ya tienes cuenta?"
      footerActionLabel="Inicia sesión"
      onFooterAction={toggleMode}
      onSubmit={handleSubmit(onSubmit)}
      isPending={registerMutation.isPending}
      submitLabel="Registrarse"
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
          <span className="error-text">{errors.username.message}</span>
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
          <span className="error-text">{errors.email.message}</span>
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
