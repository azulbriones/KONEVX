import { prisma } from "../db/prisma.js";
import { HttpError } from "../lib/httpError.js";

export async function getRegistrationsForPdf(eventId: number) {
	const event = await prisma.event.findUnique({
		where: { id: eventId },
		select: { id: true, name: true },
	});
	if (!event) throw new HttpError(404, "EVENT_NOT_FOUND", "Event not found");

	const rows = await prisma.registration.findMany({
		where: { eventId },
		orderBy: { createdAt: "desc" },
		select: {
			id: true,
			status: true,
			createdAt: true,
			participant: {
				select: { emailNormalized: true, phoneNormalized: true },
			},
		},
	});

	return { eventName: event.name, rows };
}
