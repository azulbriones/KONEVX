import { Box, Stack, Typography } from "@mui/material";
import React from "react";

function InfoRow({
	icon,
	label,
	value,
}: {
	icon: React.ReactNode;
	label: string;
	value: string;
}) {
	return (
		<Stack direction="row" spacing={2} alignItems="flex-start">
			<Box sx={{ mt: 0.5 }}>{icon}</Box>
			<Box>
				<Typography variant="subtitle2" color="text.secondary">
					{label}
				</Typography>
				<Typography variant="body1" fontWeight={500}>
					{value}
				</Typography>
			</Box>
		</Stack>
	);
}

export default InfoRow;
