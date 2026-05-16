import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import {
  Box,
  Button,
  Chip,
  Divider,
  IconButton,
  Menu,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { ExportConfigDialog } from "@/components/ui/ExportConfigDialog";
import {
  STATUS_COLOR,
  STATUS_LABEL,
  STATUS_OPTIONS,
} from "@/features/events/utils/registrationStatus";
import type { RegistrationsPageController } from "@/features/events/hooks/useRegistrationsPageController";

import { EditRegistrationDialog } from "../registrations/EditRegistrationDialog";
import styles from "./RegistrationsPageOverlays.module.css";

type Props = {
  controller: RegistrationsPageController;
};

export const RegistrationsPageOverlays = ({ controller }: Props) => {
  return (
    <>
      <ExportConfigDialog
        open={controller.exportDialogOpen}
        type={controller.exportType}
        dynamicFields={controller.dynamicFieldsList}
        onClose={() => controller.setExportDialogOpen(false)}
        onConfirm={controller.executeDownload}
      />

      <Menu
        anchorEl={controller.anchorEl}
        open={controller.menuOpen}
        onClose={controller.closeMenu}
        PaperProps={{ className: styles.menuPaper }}
      >
        <Box className={styles.menuHeader}>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography
              variant="caption"
              color="text.secondary"
              fontWeight={700}
            >
              GRUPO / DORMITORIO
            </Typography>
            {!controller.isEditingGroup && (
              <IconButton
                size="small"
                aria-label="Editar grupo o dormitorio"
                onClick={() => controller.setIsEditingGroup(true)}
              >
                <EditIcon className={styles.editIcon} />
              </IconButton>
            )}
          </Stack>

          {controller.isEditingGroup ? (
            <Stack direction="row" className={styles.groupEditorRow}>
              <TextField
                size="small"
                value={controller.tempGroup}
                onChange={(e) =>
                  controller.setTempGroup(e.target.value.toUpperCase())
                }
                autoFocus
              />
              <Button
                variant="contained"
                size="small"
                onClick={controller.onSaveGroup}
              >
                OK
              </Button>
            </Stack>
          ) : (
            <Typography
              variant="body1"
              className={styles.groupValue}
              color={
                controller.activeRow?.assignedGroup
                  ? "primary"
                  : "text.disabled"
              }
            >
              {controller.activeRow?.assignedGroup || "Sin asignar"}
            </Typography>
          )}
        </Box>

        <Divider className={styles.divider} />

        <MenuItem
          onClick={controller.openEditDialog}
          className={styles.menuItem}
        >
          <EditIcon fontSize="small" className={styles.itemIcon} />
          <Typography variant="body2" className={styles.menuItemText}>
            Editar Datos (Nombre, etc.)
          </Typography>
        </MenuItem>

        <Divider className={styles.divider} />
        <Typography
          className={styles.sectionLabel}
          variant="caption"
          color="text.secondary"
          fontWeight={700}
        >
          ACTUALIZAR ESTADO
        </Typography>
        {STATUS_OPTIONS.map((status) => (
          <MenuItem
            key={status}
            disabled={
              controller.updateStatusPending ||
              controller.activeRow?.status === status
            }
            onClick={() => controller.onChangeStatus(status)}
            className={styles.menuItem}
          >
            <Chip
              size="small"
              label={STATUS_LABEL[status]}
              color={STATUS_COLOR[status]}
              variant={
                controller.activeRow?.status === status ? "filled" : "outlined"
              }
              className={styles.statusChip}
            />
          </MenuItem>
        ))}

        <Divider className={styles.divider} />
        <MenuItem
          onClick={controller.onOpenDeleteConfirm}
          className={styles.deleteItem}
        >
          <DeleteIcon fontSize="small" className={styles.itemIcon} />
          <Typography variant="body2" className={styles.menuItemText}>
            Eliminar Registro
          </Typography>
        </MenuItem>
      </Menu>

      <ConfirmDialog
        open={controller.deleteDialog.open}
        title="Eliminar Registro"
        description={
          controller.deleteDialog.row
            ? "¿Estás seguro de que deseas ELIMINAR permanentemente el registro #" +
              controller.deleteDialog.row.id +
              "? Esta acción destruirá todas sus respuestas y no se puede deshacer."
            : undefined
        }
        confirmText="Eliminar permanentemente"
        cancelText="Cancelar"
        loading={controller.deletePending}
        onConfirm={controller.handleConfirmDelete}
        onClose={controller.closeDeleteDialog}
      />

      <EditRegistrationDialog
        open={controller.editDialog.open}
        row={controller.editDialog.row}
        event={controller.event}
        fields={controller.eventFields}
        onClose={controller.closeEditDialog}
        onSave={controller.handleSaveEditData}
        isPending={controller.updateDataPending}
      />
    </>
  );
};
