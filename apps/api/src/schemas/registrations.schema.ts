import { RegistrationStatus } from "@prisma/client";
import { z } from "zod";

export const ListRegistrationsSchema = z.object({
	skip: z.coerce.number().default(0),
	take: z.coerce.number().default(50),
	status: z.nativeEnum(RegistrationStatus).optional(),
	q: z.string().optional(),
	orderBy: z.string().optional(),
	orderDir: z.enum(["asc", "desc"]).optional(),
});

export type ListRegistrationsQuery = z.infer<typeof ListRegistrationsSchema>;
