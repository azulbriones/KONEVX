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
	const doc = new PDFDocument({ size: "A4", layout: "landscape", margin: 40 });
	doc.pipe(res);

	const MARGIN = 40;
	const PAGE_WIDTH = doc.page.width - MARGIN * 2;
	const BOTTOM_LIMIT = doc.page.height - MARGIN;

	const allPossibleColumns = [
		{ key: "id", header: "ID", width: 30 },
		{ key: "status", header: "ESTADO", width: 70 },
		{ key: "assignedGroup", header: "GRUPO", width: 60 },
		{ key: "createdAt", header: "FECHA", width: 60 },
		{ key: "contact", header: contactRequirement === "PHONE" ? "TELÉFONO" : "EMAIL", width: 110 },
		...dynamicFields.map(df => ({ key: df[0], header: df[1].toUpperCase(), width: 0 }))
	];

	const ALL_COLUMNS = options.columns && options.columns.length > 0
		? allPossibleColumns.filter(c => options.columns!.includes(c.key))
		: allPossibleColumns;

	const fixedWidthTotal = ALL_COLUMNS.reduce((sum, c) => sum + c.width, 0);
	const flexibleCols = ALL_COLUMNS.filter(c => c.width === 0);
	const autoWidth = flexibleCols.length > 0 ? (PAGE_WIDTH - fixedWidthTotal) / flexibleCols.length : 0;

	ALL_COLUMNS.forEach(c => { if (c.width === 0) c.width = autoWidth; });

	const drawTableHeader = () => {
		let x = MARGIN;
		const startY = doc.y;
		doc.fontSize(7).font("Helvetica-Bold").fillColor("#4b5563");

		ALL_COLUMNS.forEach((col) => {
			doc.text(col.header, x, startY, { width: col.width - 2, height: 20, ellipsis: true });
			x += col.width;
		});

		doc.y = startY + 15;
		doc.moveTo(MARGIN, doc.y).lineTo(MARGIN + PAGE_WIDTH, doc.y).strokeColor("#d1d5db").lineWidth(0.5).stroke();
		doc.moveDown(0.5);
	};

	const drawSectionHeader = (groupName: string) => {
		if (options.pageBreak && currentGroupValue !== "INITIAL_NULL") {
			doc.addPage();
		} else {
			doc.moveDown(1);
		}
		const title = groupName || "SIN ASIGNAR";
		doc.fillColor("#eff6ff").rect(MARGIN, doc.y, PAGE_WIDTH, 20).fill();
		doc.fillColor("#1e40af").font("Helvetica-Bold").fontSize(9)
			.text(`SECCIÓN: ${title}`, MARGIN + 10, doc.y + 6);
		doc.moveDown(0.8);
		drawTableHeader();
	};

	// --- Renderizado ---
	doc.fontSize(16).font("Helvetica-Bold").fillColor("#111827").text(eventName, { align: "left" });
	doc.moveDown(1);

	let currentGroupValue: string | null = "INITIAL_NULL";
	if (!options.groupBy) drawTableHeader();

	for (const r of rows) {
		let rowGroupValue = "";
		if (options.groupBy === 'assignedGroup') rowGroupValue = r.assignedGroup || "SIN ASIGNAR";
		else if (options.groupBy === 'groupBase') rowGroupValue = r.assignedGroup ? r.assignedGroup.replace(/[0-9]/g, '') : "SIN ASIGNAR";
		else if (options.groupBy) {
			const fv = r.fieldValues.find((f: any) => f.eventField.key === options.groupBy);
			rowGroupValue = fv?.value || "SIN ESPECIFICAR";
		}

		if (options.groupBy && rowGroupValue !== currentGroupValue) {
			drawSectionHeader(rowGroupValue);
			currentGroupValue = rowGroupValue;
		}

		if (doc.y + 20 > BOTTOM_LIMIT) {
			doc.addPage();
			drawTableHeader();
		}

		let x = MARGIN;
		const currentY = doc.y;
		doc.fontSize(7).font("Helvetica").fillColor("#374151");

		const answers: Record<string, string> = {};
		r.fieldValues.forEach((fv: any) => {
			const val = fv.value;
			answers[fv.eventField.key] = Array.isArray(val) ? val.join(", ") : String(val ?? "-");
		});

		ALL_COLUMNS.forEach((col) => {
			let text = "-";
			if (col.key === "id") text = String(r.id);
			else if (col.key === "status") text = STATUS_LABEL[r.status] || r.status;
			else if (col.key === "assignedGroup") text = r.assignedGroup || "-";
			else if (col.key === "createdAt") text = r.createdAt.toISOString().slice(0, 10);
			else if (col.key === "contact") text = contactRequirement === "PHONE" ? r.participant.phoneNormalized : r.participant.emailNormalized;
			else text = answers[col.key] || "-";

			doc.text(text || "-", x, currentY, { width: col.width - 2, lineBreak: false, ellipsis: true });
			x += col.width;
		});

		doc.y = currentY + 15;
		doc.moveTo(MARGIN, doc.y - 2).lineTo(MARGIN + PAGE_WIDTH, doc.y - 2).strokeColor("#f3f4f6").lineWidth(0.2).stroke();
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
