import EventNoteIcon from "@mui/icons-material/EventNote";
import { StatePanel } from "@/features/shared/components/StatePanel";

type DashboardEmptyStateProps = {
  onCreate: () => void;
};

export const DashboardEmptyState = ({ onCreate }: DashboardEmptyStateProps) => {
  return (
    <StatePanel
      variant="empty"
      title="Aún no tienes eventos"
      description="Crea tu primer evento para empezar a recibir registros y organizar a tus participantes."
      icon={<EventNoteIcon fontSize="large" />}
      actionLabel="Crear mi primer evento"
      onAction={onCreate}
    />
  );
};
