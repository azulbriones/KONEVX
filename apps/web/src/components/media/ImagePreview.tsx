import { env } from "@/config/env";
import { Box, Typography } from "@mui/material";

const ImagePreview = ({ value, label }: { value: any; label: string }) => {
	if (!value || (typeof value !== "string" && value.length === 0))
		return null;

	let src = "";
	if (typeof value === "string") {
		src = value.startsWith("http") ? value : `${env.API_BASE_URL}${value}`;
	} else if (value.length > 0) {
		src = URL.createObjectURL(value[0]);
	}

	if (!src) return null;

	return (
		<Box
			sx={{
				mt: 1,
				p: 1,
				border: "1px dashed #ccc",
				borderRadius: 2,
				textAlign: "center",
				bgcolor: "#f9f9f9",
			}}
		>
			<Typography
				variant="caption"
				color="textSecondary"
				display="block"
				gutterBottom
			>
				Vista previa: {label}
			</Typography>
			<img
				src={src}
				alt={`Preview ${label}`}
				style={{
					maxWidth: "100%",
					maxHeight: "120px",
					objectFit: "contain",
					borderRadius: "4px",
				}}
			/>
		</Box>
	);
};

export default ImagePreview;
