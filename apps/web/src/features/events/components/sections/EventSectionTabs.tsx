import { Box, Button, Paper, Stack, Tab, Tabs } from "@mui/material";
import styles from "./EventSectionTabs.module.css";

export type EventSectionTab = {
  label: string;
  path: string;
  enabled: boolean;
};

type EventSectionTabsProps = {
  tabs: EventSectionTab[];
  currentTab: string;
  isPublished: boolean;
  canWrite: boolean;
  onNavigate: (path: string) => void;
  onTogglePublish: () => void;
  isPublishing: boolean;
};

export const EventSectionTabs = ({
  tabs,
  currentTab,
  isPublished,
  canWrite,
  onNavigate,
  onTogglePublish,
  isPublishing,
}: EventSectionTabsProps) => {
  return (
    <Paper elevation={0} className={styles.paper}>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="flex-end"
        flexWrap="wrap-reverse"
        gap={2}
      >
        <Tabs
          value={currentTab}
          textColor="primary"
          indicatorColor="primary"
          variant="scrollable"
          scrollButtons="auto"
          className={styles.tabs}
        >
          {tabs.map((tab) => {
            if (!tab.enabled) return null;

            return (
              <Tab
                key={tab.path}
                label={tab.label}
                value={tab.path}
                onClick={() => onNavigate(tab.path)}
                className={styles.tab}
              />
            );
          })}
        </Tabs>

        {canWrite && (
          <Box className={styles.publishWrap}>
            <Button
              variant={isPublished ? "outlined" : "contained"}
              color={isPublished ? "warning" : "primary"}
              onClick={onTogglePublish}
              disabled={isPublishing}
              size="small"
              className={styles.publishButton}
            >
              {isPublished ? "Pasar a borrador" : "Publicar evento"}
            </Button>
          </Box>
        )}
      </Stack>
    </Paper>
  );
};
