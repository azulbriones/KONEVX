import {
  Box,
  Card,
  CardContent,
  Chip,
  Divider,
  Stack,
  Typography,
} from "@mui/material";

import styles from "./EventOverviewCards.module.css";

type Props = {
  items: Array<[string, number]>;
};

export const EventOverviewGroupsCard = ({ items }: Props) => {
  return (
    <Card variant="outlined" className={styles.groupCard}>
      <CardContent className={styles.cardContent}>
        <Stack
          direction="row"
          spacing={1}
          alignItems="center"
          className={styles.cardHeader}
        >
          <Box className={styles.groupAccent}>◉</Box>
          <Typography variant="h6" fontWeight={800}>
            Distribución de Grupos
          </Typography>
        </Stack>
        <Divider className={styles.divider} />
        <Box className={styles.chipWrap}>
          {items.map(([group, count]) => (
            <Chip
              key={group}
              label={`${group}: ${count}`}
              variant="filled"
              color="primary"
              className={styles.groupChip}
            />
          ))}
        </Box>
      </CardContent>
    </Card>
  );
};
