import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import { StatePanel } from "@/features/shared/components/StatePanel";

type DashboardErrorStateProps = {
  message: string;
  onRetry: () => void;
};

export const DashboardErrorState = ({
  message,
  onRetry,
}: DashboardErrorStateProps) => {
  return (
    <StatePanel
      variant="error"
      title="No pudimos cargar los eventos"
      description={message}
      icon={<ErrorOutlineIcon fontSize="large" />}
      actionLabel="Reintentar"
      onAction={onRetry}
    />
  );
};
