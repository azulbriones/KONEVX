import { env } from "@/config/env";
import { Box, Typography } from "@mui/material";

import styles from "./MediaPreview.module.css";

type PreviewValue = string[] | FileList | File[] | null | undefined;

const MultipleImagePreview = ({
  value,
  label,
}: {
  value: PreviewValue;
  label: string;
}) => {
  if (!value || value.length === 0) return null;

  const files = Array.isArray(value) ? value : Array.from(value);
  if (files.length === 0) return null;

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
      <Box className={styles.previewGrid}>
        {files.map((file, index: number) => {
          let src = "";
          if (typeof file === "string") {
            src = file.startsWith("http")
              ? file
              : `${env.API_BASE_URL}${file}`;
          } else {
            src = URL.createObjectURL(file as File);
          }
          return (
            <Box
              component="img"
              key={index}
              src={src}
              alt={`Preview ${index + 1}`}
              className={styles.previewThumb}
            />
          );
        })}
      </Box>
    </Box>
  );
};

export default MultipleImagePreview;
