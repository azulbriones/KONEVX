import { stringify } from "csv-stringify/sync";
import type { RequestHandler } from "express";
import { HttpError } from "../lib/httpError.js";
import { exportRegistrationsCsv } from "../services/registrationsExport.service.js";

function parseEventId(raw: string): number {
	const id = Number(raw);
	if (!Number.isInteger(id) || id <= 0)
		throw new HttpError(400, "INVALID_EVENT_ID", "Invalid eventId");
	return id;
}

export const exportRegistrationsCsvHandler: RequestHandler = async (
	req: { params: { eventId: string } },
	res: {
		setHeader: (arg0: string, arg1: string) => void;
		send: (arg0: any) => void;
	},
	next: (arg0: unknown) => void,
) => {
	try {
		const eventId = parseEventId(req.params.eventId);
		const { eventName, header, records } =
			await exportRegistrationsCsv(eventId);

		const csv = stringify([header, ...records]);

		const safeName = eventName.replace(/[^a-z0-9_-]+/gi, "_").toLowerCase();
		res.setHeader("Content-Type", "text/csv; charset=utf-8");
		res.setHeader(
			"Content-Disposition",
			`attachment; filename="${safeName}_registrations.csv"`,
		);

		res.send(csv);
	} catch (err) {
		next(err);
	}
};
