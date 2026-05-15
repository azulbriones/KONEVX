import { Add, Logout } from "@mui/icons-material";
import { Button, Stack } from "@mui/material";
import { SectionHeader } from "@/features/shared/components/SectionHeader";

import styles from "./DashboardHeader.module.css";

type DashboardHeaderProps = {
  onCreate: () => void;
  onLogout: () => void;
};

export const DashboardHeader = ({
  onCreate,
  onLogout,
}: DashboardHeaderProps) => (
  <SectionHeader
    title="Mis Eventos"
    subtitle="Administra y supervisa tus eventos con una vista clara y cálida."
    action={
      <Stack direction={{ xs: "column", sm: "row" }} spacing={1.25}>
        <Button
          variant="outlined"
          startIcon={<Logout />}
          onClick={onLogout}
          className={styles.secondaryButton}
        >
          Cerrar sesión
        </Button>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={onCreate}
          className={styles.primaryButton}
        >
          Nuevo Evento
        </Button>
      </Stack>
    }
  />
);
