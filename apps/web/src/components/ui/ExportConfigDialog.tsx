import CheckBoxIcon from "@mui/icons-material/CheckBox";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import {
	Autocomplete,
	Button,
	Checkbox,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	Divider,
	FormControl,
	FormControlLabel,
	InputLabel,
	MenuItem,
	Select,
	Stack,
	Switch,
	TextField,
} from "@mui/material";
import { useState } from "react";

interface ExportConfigDialogProps {
	open: boolean;
	onClose: () => void;
	onConfirm: (options: ExportOptions) => void;
	dynamicFields: { key: string; label: string }[];
	type: "xlsx" | "pdf";
}

export interface ExportOptions {
	groupBy: string;
	pageBreak: boolean;
	columns: string[];
}

// Columnas fijas del sistema
const SYSTEM_COLUMNS = [
	{ key: "id", label: "ID" },
	{ key: "status", label: "Estado" },
	{ key: "assignedGroup", label: "Grupo" },
	{ key: "createdAt", label: "Fecha de Registro" },
	{ key: "contact", label: "Contacto (Email/Tel)" },
];

export function ExportConfigDialog({
	open,
	onClose,
	onConfirm,
	dynamicFields,
	type,
}: ExportConfigDialogProps) {
	const [groupBy, setGroupBy] = useState("");
	const [pageBreak, setPageBreak] = useState(false);

	// 💡 Estado para las columnas seleccionadas
	const allAvailableColumns = [...SYSTEM_COLUMNS, ...dynamicFields];
	const [selectedColumns, setSelectedColumns] = useState(allAvailableColumns);

	const handleConfirm = () => {
		onConfirm({
			groupBy,
			pageBreak,
			columns: selectedColumns.map((c) => c.key),
		});
		onClose();
	};

	return (
		<Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
			<DialogTitle>
				Configurar Exportación {type.toUpperCase()}
			</DialogTitle>
			<DialogContent>
				<Stack spacing={3} sx={{ mt: 1 }}>
					<FormControl fullWidth size="small">
						<InputLabel>Agrupar por...</InputLabel>
						<Select
							value={groupBy}
							label="Agrupar por..."
							onChange={(e) => setGroupBy(e.target.value)}
						>
							<MenuItem value="">
								<em>Sin agrupar</em>
							</MenuItem>
							<Divider />
							<MenuItem value="assignedGroup">Por Grupo</MenuItem>
							<MenuItem value="groupBase">
								Por Letra de Grupo (A, B...)
							</MenuItem>
							{dynamicFields.map((f) => (
								<MenuItem key={f.key} value={f.key}>
									Por {f.label}
								</MenuItem>
							))}
						</Select>
					</FormControl>

					{/* 💡 Selector de Columnas */}
					<Autocomplete
						multiple
						size="small"
						options={allAvailableColumns}
						disableCloseOnSelect
						getOptionLabel={(option) => option.label}
						value={selectedColumns}
						onChange={(_, newValue) => setSelectedColumns(newValue)}
						renderOption={(props, option, { selected }) => (
							<li {...props}>
								<Checkbox
									icon={
										<CheckBoxOutlineBlankIcon fontSize="small" />
									}
									checkedIcon={
										<CheckBoxIcon fontSize="small" />
									}
									style={{ marginRight: 8 }}
									checked={selected}
								/>
								{option.label}
							</li>
						)}
						renderInput={(params) => (
							<TextField {...params} label="Columnas a incluir" />
						)}
					/>

					{type === "pdf" && (
						<FormControlLabel
							control={
								<Switch
									checked={pageBreak}
									onChange={(e) =>
										setPageBreak(e.target.checked)
									}
									disabled={!groupBy}
								/>
							}
							label="Salto de página por variante"
						/>
					)}
				</Stack>
			</DialogContent>
			<DialogActions sx={{ p: 2, pt: 0 }}>
				<Button onClick={onClose} color="inherit">
					Cancelar
				</Button>
				<Button onClick={handleConfirm} variant="contained">
					Generar
				</Button>
			</DialogActions>
		</Dialog>
	);
}
