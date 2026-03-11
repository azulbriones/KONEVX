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
	dynamicFields: [string, string][]
) => {
	const doc = new PDFDocument({ size: "A4", layout: "landscape", margin: 40 });
	doc.pipe(res);

	const MARGIN = 40;
	const PAGE_WIDTH = doc.page.width - MARGIN * 2;
	const BOTTOM_LIMIT = doc.page.height - MARGIN;

	const baseColumns = [
		{ header: "ID", width: 25, key: "id" },
		{ header: "ESTADO", width: 60, key: "status" },
		{ header: "FECHA", width: 55, key: "date" },
	];

	if (contactRequirement === "PHONE") {
		baseColumns.push({ header: "TELÉFONO", width: 70, key: "phone" });
	} else {
		baseColumns.push({ header: "EMAIL", width: 110, key: "email" });
	}

	const baseWidth = baseColumns.reduce((sum, col) => sum + col.width, 0);
	const remainingWidth = PAGE_WIDTH - baseWidth;

	const dynColWidth = dynamicFields.length > 0
		? remainingWidth / dynamicFields.length
		: 0;

	const ALL_COLUMNS = [
		...baseColumns,
		...dynamicFields.map(df => ({ header: df[1].toUpperCase(), width: dynColWidth, key: df[0] }))
	];

	const drawHeader = () => {
		let x = MARGIN;
		const startY = doc.y;

		doc.fontSize(6).font("Helvetica-Bold");

		ALL_COLUMNS.forEach((col) => {
			doc.text(col.header, x, startY, {
				width: col.width - 2,
				height: 26,
				ellipsis: true
			});
			x += col.width;
		});

		doc.y = startY + 30;
		doc.moveTo(MARGIN, doc.y).lineTo(MARGIN + PAGE_WIDTH, doc.y).stroke();
		doc.moveDown(0.5);
	};

	const checkPageBreak = () => {
		if (doc.y + 15 > BOTTOM_LIMIT) {
			doc.addPage();
			drawHeader();
		}
	};

	doc.fontSize(16).text(`Registros: ${eventName}`, { align: "center" });
	doc.fontSize(9).fillColor("gray").text(`Generado: ${new Date().toISOString().slice(0, 10)}`, { align: "center" });
	doc.moveDown(1.5);
	doc.fillColor("black");

	drawHeader();
	doc.fontSize(7).font("Helvetica");

	for (const r of rows) {
		checkPageBreak();

		let x = MARGIN;
		const currentY = doc.y;

		const answers: Record<string, string> = {};
		for (const fv of r.fieldValues) {
			const v = fv.value;
			if (v === null || v === undefined) answers[fv.eventField.key] = "-";
			else if (typeof v === "boolean") answers[fv.eventField.key] = v ? "Sí" : "No";
			else if (Array.isArray(v)) answers[fv.eventField.key] = v.join(", ");
			else answers[fv.eventField.key] = String(v);
		}

		const contactValue = contactRequirement === "PHONE"
			? (r.participant.phoneNormalized || "-")
			: (r.participant.emailNormalized || "-");

		const dataRow = [
			String(r.id),
			STATUS_LABEL[r.status] || r.status,
			r.createdAt instanceof Date ? r.createdAt.toISOString().slice(0, 10) : String(r.createdAt).slice(0, 10),
			contactValue,
			...dynamicFields.map(df => answers[df[0]] || "-")
		];

		dataRow.forEach((text, i) => {
			doc.text(text, x, currentY, {
				width: ALL_COLUMNS[i].width - 2,
				lineBreak: false,
				ellipsis: true
			});
			x += ALL_COLUMNS[i].width;
		});

		doc.y = currentY + 15;
	}

	doc.end();
};


export const exportRegistrationsPdfHandler: RequestHandler<{
	eventId: string;
}> = async (req, res, next) => {
	try {
		const eventId = parseId(req.params.eventId);
		const { eventName, contactRequirement, rows, dynamicFields } = await getRegistrationsForPdf(eventId);

		const safeName = eventName.replace(/[^a-z0-9_-]+/gi, "_").toLowerCase();

		res.setHeader("Content-Type", "application/pdf");
		res.setHeader(
			"Content-Disposition",
			`attachment; filename="${safeName}_registrations.pdf"`,
		);

		generateRegistrationsPdf(res, eventName, contactRequirement, rows, dynamicFields);
	} catch (err) {
		next(err);
	}
};
