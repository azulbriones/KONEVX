import { env } from "@/config/env";
import { Box, Typography } from "@mui/material";

const MultipleImagePreview = ({
	value,
	label,
}: {
	value: any;
	label: string;
}) => {
	if (!value || value.length === 0) return null;

	const files = Array.isArray(value) ? value : Array.from(value);
	if (files.length === 0) return null;

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
			<Box
				sx={{
					display: "flex",
					gap: 1,
					flexWrap: "wrap",
					justifyContent: "center",
				}}
			>
				{files.map((file: any, index: number) => {
					let src = "";
					if (typeof file === "string") {
						src = file.startsWith("http")
							? file
							: `${env.API_BASE_URL}${file}`;
					} else {
						src = URL.createObjectURL(file);
					}
					return (
						<img
							key={index}
							src={src}
							alt={`Preview ${index + 1}`}
							style={{
								width: "80px",
								height: "80px",
								objectFit: "cover",
								borderRadius: "4px",
								boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
							}}
						/>
					);
				})}
			</Box>
		</Box>
	);
};

export default MultipleImagePreview;
