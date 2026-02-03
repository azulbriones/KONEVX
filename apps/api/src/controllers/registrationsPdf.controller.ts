import type { RequestHandler } from "express";
import PDFDocument from "pdfkit";
import { HttpError } from "../lib/httpError.js";
import { getRegistrationsForPdf } from "../services/registrationsPdf.service.js";

function parseEventId(raw: string): number {
	const id = Number(raw);
	if (!Number.isInteger(id) || id <= 0)
		throw new HttpError(400, "INVALID_EVENT_ID", "Invalid eventId");
	return id;
}

export const exportRegistrationsPdfHandler: RequestHandler = async (
	req: { params: { eventId: string } },
	res: { setHeader: (arg0: string, arg1: string) => void },
	next: (arg0: unknown) => void,
) => {
	try {
		const eventId = parseEventId(req.params.eventId);
		const { eventName, rows } = await getRegistrationsForPdf(eventId);

		const safeName = eventName.replace(/[^a-z0-9_-]+/gi, "_").toLowerCase();

		res.setHeader("Content-Type", "application/pdf");
		res.setHeader(
			"Content-Disposition",
			`attachment; filename="${safeName}_registrations.pdf"`,
		);

		const doc = new PDFDocument({ size: "A4", margin: 40 });

		// Stream -> response
		doc.pipe(res);

		// Header
		doc.fontSize(18).text(`Registrations - ${eventName}`);
		doc.moveDown(0.3);
		doc.fontSize(10)
			.fillColor("gray")
			.text(`Generated: ${new Date().toISOString()}`);
		doc.fillColor("black");
		doc.moveDown(1);

		// Simple table layout
		const pageWidth =
			doc.page.width - doc.page.margins.left - doc.page.margins.right;

		const colId = 60;
		const colStatus = 90;
		const colDate = 110;
		const colEmail = Math.floor(
			(pageWidth - colId - colStatus - colDate) * 0.55,
		);
		const colPhone = Math.floor(
			(pageWidth - colId - colStatus - colDate) * 0.45,
		);

		const startX = doc.page.margins.left;
		let y = doc.y;

		const rowHeight = 16;

		const drawRow = (cells: string[], isHeader = false) => {
			const [id, status, date, email, phone] = cells;

			doc.fontSize(isHeader ? 10 : 9).font(
				isHeader ? "Helvetica-Bold" : "Helvetica",
			);

			let x = startX;
			doc.text(id, x, y, { width: colId, ellipsis: true });
			x += colId;
			doc.text(status, x, y, { width: colStatus, ellipsis: true });
			x += colStatus;
			doc.text(date, x, y, { width: colDate, ellipsis: true });
			x += colDate;
			doc.text(email, x, y, { width: colEmail, ellipsis: true });
			x += colEmail;
			doc.text(phone, x, y, { width: colPhone, ellipsis: true });

			y += rowHeight;

			const bottom = doc.page.height - doc.page.margins.bottom;
			if (y > bottom - rowHeight) {
				doc.addPage();
				y = doc.page.margins.top;

				drawRow(["ID", "STATUS", "DATE", "EMAIL", "PHONE"], true);
				doc.moveTo(startX, y - 4)
					.lineTo(startX + pageWidth, y - 4)
					.stroke();
			}
		};

		// Table header
		drawRow(["ID", "STATUS", "DATE", "EMAIL", "PHONE"], true);
		doc.moveTo(startX, y - 4)
			.lineTo(startX + pageWidth, y - 4)
			.stroke();

		// Rows
		for (const r of rows) {
			drawRow([
				String(r.id),
				r.status,
				r.createdAt.toISOString().slice(0, 10),
				r.participant.emailNormalized ?? "",
				r.participant.phoneNormalized ?? "",
			]);
		}

		doc.end();
	} catch (err) {
		next(err);
	}
};
