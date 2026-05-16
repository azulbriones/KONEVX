import MoreVertIcon from "@mui/icons-material/MoreVert";
import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  CircularProgress,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import type { CSSProperties, MouseEvent } from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { designTokens } from "@/config/designTokens";
import { useDeleteEvent, useSetPublish } from "../../hooks/useEvents";
import type { EventListItem } from "../../types";
import { DeleteEventDialog } from "./DeleteEventDialog";
import { EventActionsMenu } from "./EventActionsMenu";
import { StatusPill } from "@/features/shared/components/StatusPill";

import styles from "./EventCard.module.css";

function formatCreatedAt(createdAt: string) {
  return new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(createdAt));
}

export const EventCard = ({ event }: { event: EventListItem }) => {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const setPublishMutation = useSetPublish(event.id);
  const deleteMutation = useDeleteEvent();

  const handleMenuOpen = (e: MouseEvent<HTMLElement>) => {
    e.stopPropagation();
    setAnchorEl(e.currentTarget);
  };

  const handleConfirmDelete = () => {
    deleteMutation.mutate(event.id, {
      onSuccess: () => setShowDeleteModal(false),
    });
  };

  const isPending = setPublishMutation.isPending || deleteMutation.isPending;

  return (
    <Card
      className={styles.card}
      style={
        {
          opacity: isPending ? 0.75 : 1,
          "--event-bar": event.isPublished
            ? designTokens.colors.primary
            : designTokens.colors.warning,
        } as CSSProperties
      }
    >
      <Box className={styles.topBar} />
      <Box className={styles.bodyWrap}>
        <CardActionArea
          onClick={() => navigate(`/events/${event.id}`)}
          className={styles.actionArea}
        >
          <CardContent className={styles.content}>
            <Stack spacing={1.25}>
              <Box className={styles.headerRow}>
                <StatusPill
                  label={event.isPublished ? "Publicado" : "Borrador"}
                  tone={event.isPublished ? "success" : "warning"}
                />
                <Typography
                  variant="caption"
                  color="text.secondary"
                  className={styles.createdAt}
                >
                  Creado el {formatCreatedAt(event.createdAt)}
                </Typography>
              </Box>
              <Box>
                <Typography variant="h6" fontWeight={950} lineHeight={1.08}>
                  {event.name}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  className={styles.slug}
                >
                  /{event.slug}
                </Typography>
              </Box>
              <Box className={styles.tagsRow}>
                <StatusPill label={`${event.capacity} cupos`} tone="neutral" />
                <StatusPill
                  label={
                    event.contactRequirement === "EMAIL"
                      ? "Contacto por email"
                      : "Contacto por teléfono"
                  }
                  tone="primary"
                />
              </Box>
            </Stack>
          </CardContent>
        </CardActionArea>

        <IconButton
          aria-label={`Abrir acciones de ${event.name}`}
          aria-haspopup="menu"
          onClick={handleMenuOpen}
          disabled={isPending}
          className={styles.menuButton}
        >
          {isPending ? <CircularProgress size={20} /> : <MoreVertIcon />}
        </IconButton>
      </Box>

      <EventActionsMenu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
        isPublished={event.isPublished}
        onView={() => navigate(`/events/${event.id}`)}
        onEdit={() => navigate(`/events/${event.id}/edit`)}
        onTogglePublish={() => setPublishMutation.mutate(!event.isPublished)}
        onDelete={() => {
          setAnchorEl(null);
          setShowDeleteModal(true);
        }}
      />

      <DeleteEventDialog
        open={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleConfirmDelete}
        eventName={event.name}
        isLoading={deleteMutation.isPending}
      />
    </Card>
  );
};
