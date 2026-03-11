import { Box, Card, CardContent, Stack, Typography } from "@mui/material";
import React from "react";

function StatCard({
	title,
	value,
	icon,
	bgColor,
}: {
	title: string;
	value: string | number;
	icon: React.ReactNode;
	bgColor: string;
}) {
	return (
		<Card
			variant="outlined"
			sx={{
				borderRadius: 3,
				transition: "transform 0.2s",
				"&:hover": {
					transform: "translateY(-2px)",
					boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
				},
			}}
		>
			<CardContent>
				<Stack direction="row" alignItems="center" spacing={2.5}>
					<Box
						sx={{
							p: 1.5,
							bgcolor: bgColor,
							borderRadius: 2,
							display: "flex",
						}}
					>
						{icon}
					</Box>
					<Box>
						<Typography
							variant="caption"
							color="text.secondary"
							fontWeight={700}
							sx={{ letterSpacing: 0.5 }}
						>
							{title.toUpperCase()}
						</Typography>
						<Typography variant="h4" fontWeight={800}>
							{value}
						</Typography>
					</Box>
				</Stack>
			</CardContent>
		</Card>
	);
}

export default StatCard;
