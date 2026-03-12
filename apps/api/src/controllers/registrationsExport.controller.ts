import ExcelJS from "exceljs";
import type { RequestHandler } from "express";
import { parseId } from "../lib/parser.js";
import { getRegistrationsGrouped } from "../services/registrationsExport.service.js";

export const exportRegistrationsExcelHandler: RequestHandler<{
	eventId: string;
}> = async (req, res, next) => {
	try {
		const eventId = parseId(req.params.eventId);

		const options = {
			status: req.query.status as string,
			groupBy: req.query.groupBy as string,
			columns: typeof req.query.columns === 'string' ? req.query.columns.split(',') : []
		};

		const { eventName, header, sheets } = await getRegistrationsGrouped(eventId, options);

		const workbook = new ExcelJS.Workbook();
		const safeName = eventName.replace(/[^a-z0-9_-]+/gi, "_").toLowerCase();

		Object.entries(sheets).forEach(([sheetName, records]) => {
			const cleanSheetName = sheetName.substring(0, 31).replace(/[/*?:[\]]/g, "");
			const sheet = workbook.addWorksheet(cleanSheetName);

			const headerRow = sheet.addRow(header);
			headerRow.eachCell((cell) => {
				cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
				cell.fill = {
					type: 'pattern',
					pattern: 'solid',
					fgColor: { argb: 'FF1E40AF' }
				};
				cell.alignment = { vertical: 'middle', horizontal: 'center' };
			});

			sheet.addRows(records);

			sheet.columns.forEach((column, i) => {
				column.width = 22;
				if (header[i] === "FECHA DE REGISTRO") {
					column.numFmt = 'dd/mm/yyyy hh:mm';
				}
			});
		});

		res.setHeader(
			"Content-Type",
			"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
		);
		res.setHeader(
			"Content-Disposition",
			`attachment; filename="${safeName}_registrations.xlsx"`
		);

		await workbook.xlsx.write(res);
		res.end();

	} catch (err) {
		next(err);
	}
};
