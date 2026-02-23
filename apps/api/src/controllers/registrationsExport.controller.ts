import { stringify } from "csv-stringify";
import type { RequestHandler } from "express";
import { parseId } from "../lib/parser.js";
import { exportRegistrationsCsv } from "../services/registrationsExport.service.js";

export const exportRegistrationsCsvHandler: RequestHandler<{
	eventId: string;
}> = async (req, res, next) => {
	try {
		const eventId = parseId(req.params.eventId);

		const { eventName, header, records } =
			await exportRegistrationsCsv(eventId);

		const safeName = eventName.replace(/[^a-z0-9_-]+/gi, "_").toLowerCase();

		res.setHeader("Content-Type", "text/csv; charset=utf-8");
		res.setHeader(
			"Content-Disposition",
			`attachment; filename="${safeName}_registrations.csv"`,
		);

		res.write("\uFEFF");

		const stringifier = stringify({
			header: true,
			columns: header,
			cast: {
				date: (date) => date.toISOString(),
			},
		});

		stringifier.pipe(res);

		records.forEach((record: unknown[]) => stringifier.write(record));

		stringifier.end();

		stringifier.on("error", (err) => {
			console.error("CSV Stream Error", err);
			res.end();
		});
	} catch (err) {
		next(err);
	}
};
