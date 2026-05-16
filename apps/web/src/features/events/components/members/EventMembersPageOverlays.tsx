import DeleteIcon from "@mui/icons-material/Delete";
import { Add } from "@mui/icons-material";
import {
  Box,
  Button,
  Divider,
  Drawer,
  Menu,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import { ConfirmDialog } from "@/components/ui/ConfirmDialog";

import {
  ROLE_OPTIONS,
  type EventMembersPageController,
} from "@/features/events/hooks/useEventMembersPageController";

import styles from "./EventMembersPageOverlays.module.css";

type Props = {
  controller: EventMembersPageController;
};

export const EventMembersPageOverlays = ({ controller }: Props) => {
  return (
    <>
      <Menu
        anchorEl={controller.menuAnchor}
        open={controller.menuOpen}
        onClose={controller.closeMenu}
        PaperProps={{ className: styles.menuPaper }}
      >
        <Typography
          variant="caption"
          color="text.secondary"
          className={styles.menuHeading}
        >
          CAMBIAR ROL
        </Typography>

        {ROLE_OPTIONS.filter(
          (role) => role !== controller.menuRow?.eventRole,
        ).map((role) => (
          <MenuItem
            key={role}
            onClick={() => controller.setMemberRole(role)}
            disabled={
              controller.busy ||
              (role !== "EDITOR" ? controller.disableDowngrade : false)
            }
          >
            Asignar como {role}
          </MenuItem>
        ))}

        <Box className={styles.divider} />

        <MenuItem
          onClick={controller.askRemove}
          className={styles.dangerItem}
          disabled={controller.disableRemove}
        >
          <DeleteIcon fontSize="small" className={styles.itemIcon} />
          Quitar del evento
        </MenuItem>
      </Menu>

      <ConfirmDialog
        open={controller.confirmOpen}
        title="Eliminar miembro"
        description={
          controller.deleteTarget
            ? `¿Estás seguro de que deseas quitar a "${controller.deleteTarget.email}"? Perderá el acceso a este evento.`
            : undefined
        }
        confirmText="Sí, quitar"
        cancelText="Cancelar"
        loading={controller.removeMutation.isPending}
        onClose={() => {
          controller.setConfirmOpen(false);
          controller.setDeleteTarget(null);
        }}
        onConfirm={controller.doRemove}
      />

      <Drawer
        anchor="right"
        open={controller.addDrawerOpen}
        onClose={() => controller.setAddDrawerOpen(false)}
      >
        <Box className={styles.drawer}>
          <Stack spacing={2.25}>
            <Stack spacing={0.75}>
              <Typography variant="h6" fontWeight={900}>
                Agregar miembro
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Invitá a alguien ya registrado y asignale el rol correcto.
              </Typography>
            </Stack>

            <Divider />

            <Stack component="form" spacing={2} onSubmit={controller.onAdd}>
              <TextField
                autoFocus
                fullWidth
                label="Email del usuario"
                placeholder="usuario@ejemplo.com"
                type="email"
                value={controller.email}
                onChange={(e) => controller.setEmail(e.target.value)}
                disabled={controller.busy}
              />

              <TextField
                fullWidth
                label="Rol"
                select
                value={controller.role}
                onChange={(e) =>
                  controller.setRole(
                    e.target.value as (typeof ROLE_OPTIONS)[number],
                  )
                }
                disabled={controller.busy}
              >
                {ROLE_OPTIONS.map((role) => (
                  <MenuItem key={role} value={role}>
                    {role}
                  </MenuItem>
                ))}
              </TextField>

              <Stack direction="row" spacing={1.5} justifyContent="flex-end">
                <Button
                  variant="text"
                  onClick={() => controller.setAddDrawerOpen(false)}
                  disabled={controller.busy}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  startIcon={<Add />}
                  disabled={controller.addDisabled}
                >
                  {controller.addPending ? "Agregando..." : "Agregar"}
                </Button>
              </Stack>
            </Stack>
          </Stack>
        </Box>
      </Drawer>
    </>
  );
};
