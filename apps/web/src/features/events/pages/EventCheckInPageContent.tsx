import { Alert, Box, CircularProgress, Stack, Typography } from "@mui/material";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { ExportConfigDialog } from "@/components/ui/ExportConfigDialog";
import { CheckInActionsBar } from "../components/check-in/CheckInActionsBar";
import { CheckInSummarySection } from "../components/check-in/CheckInSummarySection";
import { QRScannerDialog } from "../components/check-in/QRScannerDialog";
import { QuickRegistrationDialog } from "../components/check-in/QuickRegistrationDialog";
import { RegistrationCard } from "../components/check-in/RegistrationCard";
import { useCheckInPageController } from "../hooks/useCheckInPageController";
import styles from "./EventCheckInPageContent.module.css";

export const EventCheckInPage = () => {
  const controller = useCheckInPageController();

  return (
    <Box className={styles.container}>
      <Stack spacing={2.5}>
        <CheckInSummarySection
          counts={controller.counts}
          groupEntries={controller.groupEntries}
        />

        <CheckInActionsBar
          searchTerm={controller.searchTerm}
          isExporting={controller.isExporting}
          canCheckIn={controller.access.canCheckIn}
          attendedCount={controller.counts.ATTENDED}
          onSearchTermChange={controller.setSearchTerm}
          onDownloadClick={controller.handleDownloadClick}
          onOpenQrScanner={() => controller.setQrScannerOpen(true)}
          onOpenQuickRegistration={() => controller.setQuickRegOpen(true)}
        />

        {controller.statusMsg && (
          <Alert
            severity={controller.statusMsg.type}
            variant="filled"
            onClose={() => controller.setStatusMsg(null)}
            className={styles.statusAlert}
          >
            {controller.statusMsg.text}
          </Alert>
        )}

        <Stack spacing={2}>
          {controller.isLoading ? (
            <Box className={styles.loadingState}>
              <CircularProgress />
            </Box>
          ) : controller.data?.items.length === 0 ? (
            <Box className={styles.emptyState}>
              <Typography color="text.secondary" className={styles.emptyText}>
                No se encontraron resultados.
              </Typography>
            </Box>
          ) : (
            controller.data?.items.map((reg) => (
              <RegistrationCard
                key={reg.id}
                reg={reg}
                loadingId={controller.loadingId}
                access={controller.access}
                event={controller.event}
                onCheckIn={controller.handleCheckIn}
                onCancelCheckIn={controller.handleCancelCheckIn}
              />
            ))
          )}
        </Stack>
      </Stack>

      <ExportConfigDialog
        open={controller.exportDialogOpen}
        type={controller.exportType}
        dynamicFields={controller.dynamicFieldsList}
        onClose={() => controller.setExportDialogOpen(false)}
        onConfirm={controller.executeDownload}
      />
      <QuickRegistrationDialog
        open={controller.quickRegOpen}
        onClose={() => controller.setQuickRegOpen(false)}
        onConfirm={controller.handleQuickRegistration}
        isSubmitting={controller.isQuickRegistering}
      />
      <QRScannerDialog
        open={controller.qrScannerOpen}
        onClose={() => controller.setQrScannerOpen(false)}
        onScan={controller.handleQRScan}
      />

      <ConfirmDialog
        open={controller.cancelDialog.open}
        title="Anular Entrada"
        description={`¿Seguro que quieres anular la entrada del ID #${controller.cancelDialog.regId}? El participante volverá a estar como "Registrado".`}
        confirmText="Anular entrada"
        cancelText="Mantener entrada"
        loading={controller.cancelCheckInPending}
        onConfirm={controller.executeCancelCheckIn}
        onClose={() => controller.setCancelDialog({ open: false, regId: null })}
      />
    </Box>
  );
};
