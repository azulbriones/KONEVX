import { env } from "@/config/env";
import { Box, Typography } from "@mui/material";

import styles from "./MediaPreview.module.css";

type PreviewValue = string | FileList | File[] | null | undefined;

const VideoPreview = ({
  value,
  label,
}: {
  value: PreviewValue;
  label: string;
}) => {
  if (!value || (typeof value !== "string" && value.length === 0)) {
    return null;
  }

  let src = "";
  if (typeof value === "string") {
    src = value.startsWith("http") ? value : `${env.API_BASE_URL}${value}`;
  } else if (value.length > 0) {
    const file = value[0] as File | undefined;
    if (file) src = URL.createObjectURL(file);
  }

  if (!src) return null;

  return (
    <Box className={styles.previewShell}>
      <Typography
        variant="caption"
        color="textSecondary"
        display="block"
        gutterBottom
        className={styles.previewLabel}
      >
        Vista previa: {label}
      </Typography>
      <Box
        component="video"
        src={src}
        controls
        className={styles.previewVideo}
      />
    </Box>
  );
};

export default VideoPreview;
