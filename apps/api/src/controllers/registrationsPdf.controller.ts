import type { RequestHandler, Response } from "express";
import PDFDocument from "pdfkit";
import { parseId } from "../lib/parser.js";
import { getRegistrationsForPdf } from "../services/registrationsPdf.service.js";

const STATUS_LABEL: Record<string, string> = {
	REGISTERED: "Registrado",
	CONFIRMED: "Confirmado",
	CANCELLED: "Cancelado",
	ATTENDED: "Asistió",
};

const generateRegistrationsPdf = (
	res: Response,
	eventName: string,
	contactRequirement: string,
	rows: any[],
	dynamicFields: [string, string][],
	options: { groupBy?: string; pageBreak?: boolean; columns?: string[] }
) => {
	const doc = new PDFDocument({
		size: "A4",
		layout: "landscape",
		margin: 30,
		bufferPages: true
	});
	doc.pipe(res);

	const MARGIN = 30;
	const PAGE_WIDTH = doc.page.width - MARGIN * 2;
	const BOTTOM_LIMIT = doc.page.height - MARGIN - 30;

	const C_PRIMARY = "#2563eb";
	const C_DANGER = "#dc2626";
	const C_DARK = "#0f172a";
	const C_MUTED = "#64748b";
	const C_ZEBRA = "#f8fafc";
	const C_BORDER = "#e2e8f0";

	const allPossibleColumns = [
		{ key: "id", header: "ID" },
		{ key: "status", header: "ESTADO" },
		{ key: "assignedGroup", header: "GRUPO" },
		{ key: "createdAt", header: "FECHA" },
		{ key: "contact", header: contactRequirement === "PHONE" ? "TELÉFONO" : "EMAIL" },
		...dynamicFields.map(df => ({ key: df[0], header: String(df[1] || "").toUpperCase() }))
	];

	const ALL_COLUMNS = options.columns && options.columns.length > 0
		? allPossibleColumns.filter(c => options.columns!.includes(c.key))
		: allPossibleColumns;

	const COLUMNS_PER_ROW = 4;
	const COL_WIDTH = PAGE_WIDTH / COLUMNS_PER_ROW;
	const ROW_HEIGHT = 24;

	const drawDocumentHeader = (isFirstPage: boolean = false) => {
		const startY = doc.y;
		doc.fillColor(C_PRIMARY).rect(MARGIN, startY, 4, 35).fill();
		doc.fontSize(16).font("Helvetica-Bold").fillColor(C_DARK).text(eventName, MARGIN + 12, startY);
		doc.fontSize(8).font("Helvetica").fillColor(C_MUTED).text(`Reporte generado: ${new Date().toLocaleString()}`, MARGIN + 12, startY + 18);

		if (isFirstPage) {
			doc.fontSize(10).font("Helvetica-Bold").fillColor(C_PRIMARY)
				.text(`TOTAL DE REGISTROS: ${rows.length}`, MARGIN, startY + 8, { align: "right", width: PAGE_WIDTH });
		}
		doc.y = startY + 45;
	};

	const drawSectionHeader = (groupName: string) => {
		const title = groupName || "SIN ASIGNAR";
		doc.fillColor(C_PRIMARY).rect(MARGIN, doc.y, PAGE_WIDTH, 22).fill();
		doc.fillColor("#ffffff").font("Helvetica-Bold").fontSize(10)
			.text(`  SECCIÓN: ${String(title).toUpperCase()}`, MARGIN + 5, doc.y + 7);
		doc.moveDown(1.5);
	};

	drawDocumentHeader(true);

	if (options.groupBy) {
		rows.sort((a, b) => {
			const getVal = (r: any) => {
				if (options.groupBy === 'assignedGroup') return r.assignedGroup || "SIN ASIGNAR";
				if (options.groupBy === 'groupBase') return r.assignedGroup ? r.assignedGroup.replace(/[0-9]/g, '') : "SIN ASIGNAR";
				const fv = r.fieldValues.find((f: any) => f.eventField.key === options.groupBy);
				return fv?.value || "SIN ESPECIFICAR";
			};
			const valA = String(getVal(a)).toUpperCase();
			const valB = String(getVal(b)).toUpperCase();
			return valA.localeCompare(valB);
		});
	}

	let currentGroupValue: string | null = "INITIAL_NULL";
	let rowCount = 0;

	for (const r of rows) {
		let rowGroupValue = "";
		if (options.groupBy === 'assignedGroup') rowGroupValue = r.assignedGroup || "SIN ASIGNAR";
		else if (options.groupBy === 'groupBase') rowGroupValue = r.assignedGroup ? r.assignedGroup.replace(/[0-9]/g, '') : "SIN ASIGNAR";
		else if (options.groupBy) {
			const fv = r.fieldValues.find((f: any) => f.eventField.key === options.groupBy);
			rowGroupValue = fv?.value || "SIN ESPECIFICAR";
		}

		if (options.groupBy && rowGroupValue !== currentGroupValue) {
			const isFirstGroup = currentGroupValue === "INITIAL_NULL";
			currentGroupValue = rowGroupValue;
			if (!isFirstGroup && options.pageBreak) {
				doc.addPage();
				drawDocumentHeader(false);
			} else if (!isFirstGroup) {
				doc.moveDown(1);
			}
			drawSectionHeader(rowGroupValue);
			rowCount = 0;
		}

		const totalSubRows = Math.ceil(ALL_COLUMNS.length / COLUMNS_PER_ROW);
		const hasNotes = !!r.checkInNotes;
		const blockHeight = (totalSubRows * ROW_HEIGHT) + 12 + (hasNotes ? 18 : 0);

		if (doc.y + blockHeight > BOTTOM_LIMIT) {
			doc.addPage();
			drawDocumentHeader(false);
			if (options.groupBy) drawSectionHeader(currentGroupValue!);
		}

		const startY = doc.y;

		if (rowCount % 2 !== 0) {
			doc.fillColor(C_ZEBRA).rect(MARGIN, startY, PAGE_WIDTH, blockHeight).fill();
		}

		const answers: Record<string, string> = {};
		r.fieldValues.forEach((fv: any) => {
			const val = fv.value;
			answers[fv.eventField.key] = Array.isArray(val) ? val.join(", ") : String(val ?? "-");
		});

		let currentX = MARGIN + 5;
		let currentY = startY + 6;
		let colIndex = 0;

		ALL_COLUMNS.forEach((col) => {
			let text = "-";
			if (col.key === "id") text = String(r.id);
			else if (col.key === "status") text = STATUS_LABEL[r.status] || r.status;
			else if (col.key === "assignedGroup") text = r.assignedGroup || "-";
			else if (col.key === "createdAt") text = r.createdAt.toISOString().slice(0, 10);
			else if (col.key === "contact") text = contactRequirement === "PHONE" ? r.participant.phoneNormalized : r.participant.emailNormalized;
			else text = answers[col.key] || "-";

			doc.fontSize(6).font("Helvetica-Bold").fillColor(C_MUTED).text(col.header, currentX, currentY, { width: COL_WIDTH - 10, ellipsis: true });
			doc.fontSize(9).font("Helvetica").fillColor(C_DARK).text(text || "-", currentX, currentY + 9, { width: COL_WIDTH - 10, ellipsis: true });

			colIndex++;
			if (colIndex % COLUMNS_PER_ROW === 0) {
				currentX = MARGIN + 5;
				currentY += ROW_HEIGHT;
			} else {
				currentX += COL_WIDTH;
			}
		});

		if (hasNotes) {
			const notesY = startY + (totalSubRows * ROW_HEIGHT) + 6;
			doc.fontSize(7).font("Helvetica-Bold").fillColor(C_DANGER)
				.text("INCIDENCIA / NOTA:", MARGIN + 5, notesY);
			doc.fontSize(8).font("Helvetica-Oblique").fillColor(C_DARK)
				.text(r.checkInNotes, MARGIN + 85, notesY, { width: PAGE_WIDTH - 95, ellipsis: true });
		}

		doc.y = startY + blockHeight;
		doc.moveTo(MARGIN, doc.y).lineTo(MARGIN + PAGE_WIDTH, doc.y).strokeColor(C_BORDER).lineWidth(0.5).stroke();
		rowCount++;
	}

	doc.end();
};

export const exportRegistrationsPdfHandler: RequestHandler<{
	eventId: string;
}> = async (req, res, next) => {
	try {
		const eventId = parseId(req.params.eventId);
		const options = {
			status: req.query.status as string,
			groupBy: req.query.groupBy as string,
			pageBreak: req.query.pageBreak === "true",
			columns: typeof req.query.columns === 'string' ? req.query.columns.split(',') : []
		};

		const { eventName, contactRequirement, rows, dynamicFields } = await getRegistrationsForPdf(eventId, options);
		const safeName = eventName.replace(/[^a-z0-9_-]+/gi, "_").toLowerCase();

		res.setHeader("Content-Type", "application/pdf");
		res.setHeader("Content-Disposition", `attachment; filename="${safeName}_registrations.pdf"`);

		generateRegistrationsPdf(res, eventName, contactRequirement, rows, dynamicFields, options);
	} catch (err) {
		next(err);
	}
};
