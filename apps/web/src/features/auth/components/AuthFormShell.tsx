import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Divider,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import type { FormEventHandler, ReactNode } from "react";

type AuthFormShellProps = {
  label: string;
  title: string;
  description: string;
  error?: string | null;
  children: ReactNode;
  footerText: string;
  footerActionLabel: string;
  onFooterAction: () => void;
  onSubmit: FormEventHandler<HTMLFormElement>;
  isPending: boolean;
  submitLabel: string;
};

export const AuthFormShell = ({
  label,
  title,
  description,
  error,
  children,
  footerText,
  footerActionLabel,
  onFooterAction,
  onSubmit,
  isPending,
  submitLabel,
}: AuthFormShellProps) => {
  return (
    <div className="form-fade-in">
      <Paper variant="outlined" className="auth-form-shell">
        <Stack spacing={1}>
          <Typography
            variant="overline"
            color="primary"
            className="auth-form-label"
          >
            {label}
          </Typography>
          <Typography variant="h5" fontWeight={900} lineHeight={1.1}>
            {title}
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            className="auth-form-description"
          >
            {description}
          </Typography>
        </Stack>
      </Paper>

      {error ? (
        <Alert severity="error" className="auth-form-error">
          {error}
        </Alert>
      ) : null}

      <form onSubmit={onSubmit} noValidate className="auth-form">
        {children}

        <Button
          type="submit"
          variant="contained"
          className="btn-submit"
          disabled={isPending}
        >
          {isPending && (
            <CircularProgress
              size={20}
              color="inherit"
              className="auth-form-spinner"
            />
          )}
          {isPending ? "Procesando..." : submitLabel}
        </Button>

        <Divider className="auth-form-divider" />
        <Box className="auth-form-footer">
          <Typography variant="body2" color="text.secondary">
            {footerText}
          </Typography>
          <Button
            type="button"
            onClick={onFooterAction}
            variant="text"
            className="auth-link-button"
          >
            {footerActionLabel}
          </Button>
        </Box>
      </form>
    </div>
  );
};
