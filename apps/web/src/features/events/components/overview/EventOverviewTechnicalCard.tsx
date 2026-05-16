import {
  Box,
  Card,
  CardContent,
  Chip,
  Divider,
  Grid,
  Stack,
  Typography,
} from "@mui/material";
import type { EventDetail } from "../../types";

import styles from "./EventOverviewCards.module.css";

type Props = {
  event: EventDetail;
  contactLabel: string;
};

export const EventOverviewTechnicalCard = ({ event, contactLabel }: Props) => {
  return (
    <Card variant="outlined" className={styles.technicalCard}>
      <CardContent className={styles.cardContent}>
        <Typography variant="h6" fontWeight={800} gutterBottom>
          Configuración Técnica
        </Typography>
        <Divider className={styles.dividerLarge} />

        <Stack spacing={3}>
          <Box>
            <Typography variant="subtitle2" color="text.secondary">
              Slug (URL)
            </Typography>
            <Chip
              label={`/e/${event.slug}`}
              size="small"
              className={styles.slugChip}
            />
          </Box>

          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Typography variant="subtitle2" color="text.secondary">
                Capacidad Máxima
              </Typography>
              <Typography variant="body1" fontWeight={600}>
                {event.capacity} personas
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="subtitle2" color="text.secondary">
                Requisito de Contacto
              </Typography>
              <Typography
                variant="body1"
                fontWeight={600}
                className={styles.capitalize}
              >
                {contactLabel}
              </Typography>
            </Grid>
          </Grid>

          <Box>
            <Typography variant="subtitle2" color="text.secondary">
              ID Interno
            </Typography>
            <Typography
              variant="body2"
              color="text.disabled"
              className={styles.mono}
            >
              #{event.id}
            </Typography>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
};
