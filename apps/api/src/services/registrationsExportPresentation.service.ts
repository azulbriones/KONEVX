import ExcelJS from "exceljs";
import type { Response } from "express";

type ExcelSheetRecords = Record<string, Array<Record<string, unknown>>>;

export async function sendRegistrationsExcel(
	res: Response,
	eventName: string,
	header: string[],
	sheets: ExcelSheetRecords,
) {
	const workbook = new ExcelJS.Workbook();
	const safeName = eventName.replace(/[^a-z0-9_-]+/gi, "_").toLowerCase();

	Object.entries(sheets).forEach(([sheetName, records]) => {
		const cleanSheetName = sheetName.substring(0, 31).replace(/[/*?:[\]]/g, "");
		const sheet = workbook.addWorksheet(cleanSheetName);

		const headerRow = sheet.addRow(header);
		headerRow.eachCell((cell) => {
			cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
			cell.fill = {
				type: "pattern",
				pattern: "solid",
				fgColor: { argb: "FF1E40AF" },
			};
			cell.alignment = { vertical: "middle", horizontal: "center" };
		});

		sheet.addRows(records);

		sheet.columns.forEach((column, i) => {
			column.width = 22;
			if (header[i] === "FECHA DE REGISTRO") {
				column.numFmt = "dd/mm/yyyy hh:mm";
			}
		});
	});

	res.setHeader(
		"Content-Type",
		"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
	);
	res.setHeader(
		"Content-Disposition",
		`attachment; filename="${safeName}_registrations.xlsx"`,
	);

	await workbook.xlsx.write(res);
	res.end();
}
