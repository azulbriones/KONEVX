import type { RequestHandler, Response } from "express";
import PDFDocument from "pdfkit";
import { parseId } from "../lib/parser.js";
import { getRegistrationsForPdf } from "../services/registrationsPdf.service.js";

// ==========================================
// PDF GENERATOR (Presentation Layer)
// ==========================================
const generateRegistrationsPdf = (
	res: Response,
	eventName: string,
	rows: Array<{
		id: number;
		status: string;
		createdAt: Date | string;
		participant: {
			emailNormalized: string | null;
			phoneNormalized: string | null;
		};
	}>,
) => {
	const doc = new PDFDocument({ size: "A4", margin: 40 });

	doc.pipe(res);

	const MARGIN = 40;
	const PAGE_WIDTH = doc.page.width - MARGIN * 2;
	const ROW_HEIGHT = 20;
	const BOTTOM_LIMIT = doc.page.height - MARGIN;

	const COLUMNS = [
		{ header: "ID", width: 40, align: "left" },
		{ header: "STATUS", width: 80, align: "left" },
		{ header: "DATE", width: 90, align: "left" },
		{ header: "EMAIL", width: 160, align: "left" },
		{ header: "PHONE", width: 100, align: "left" },
	] as const;

	const drawHeader = () => {
		let x = MARGIN;
		doc.fontSize(9).font("Helvetica-Bold");

		COLUMNS.forEach((col) => {
			doc.text(col.header, x, doc.y, {
				width: col.width,
				ellipsis: true,
			});
			x += col.width;
		});

		doc.moveDown(0.5);
		doc.moveTo(MARGIN, doc.y)
			.lineTo(MARGIN + PAGE_WIDTH, doc.y)
			.stroke();
		doc.moveDown(0.5);
	};

	const checkPageBreak = () => {
		if (doc.y + ROW_HEIGHT > BOTTOM_LIMIT) {
			doc.addPage();
			drawHeader();
		}
	};

	doc.fontSize(16).text(`Registrations: ${eventName}`, { align: "center" });
	doc.fontSize(10)
		.fillColor("gray")
		.text(`Generated: ${new Date().toISOString()}`, { align: "center" });
	doc.moveDown(2);
	doc.fillColor("black");

	drawHeader();

	doc.fontSize(9).font("Helvetica");

	for (const r of rows) {
		checkPageBreak();

		let x = MARGIN;
		const currentY = doc.y;

		const data = [
			String(r.id),
			r.status,
			r.createdAt instanceof Date
				? r.createdAt.toISOString().slice(0, 10)
				: String(r.createdAt),
			r.participant.emailNormalized || "-",
			r.participant.phoneNormalized || "-",
		];

		data.forEach((text, i) => {
			doc.text(text, x, currentY, {
				width: COLUMNS[i].width,
				ellipsis: true,
				height: ROW_HEIGHT,
			});
			x += COLUMNS[i].width;
		});

		doc.y = currentY + ROW_HEIGHT;
	}

	doc.end();
};

// ==========================================
// CONTROLLER (HTTP Layer)
// ==========================================

export const exportRegistrationsPdfHandler: RequestHandler<{
	eventId: string;
}> = async (req, res, next) => {
	try {
		const eventId = parseId(req.params.eventId);
		const { eventName, rows } = await getRegistrationsForPdf(eventId);
		const safeName = eventName.replace(/[^a-z0-9_-]+/gi, "_").toLowerCase();

		res.setHeader("Content-Type", "application/pdf");
		res.setHeader(
			"Content-Disposition",
			`attachment; filename="${safeName}_registrations.pdf"`,
		);

		generateRegistrationsPdf(res, eventName, rows);
	} catch (err) {
		next(err);
	}
};
