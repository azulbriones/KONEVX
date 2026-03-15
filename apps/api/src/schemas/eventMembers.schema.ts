import { z } from "zod";

export const AddMemberSchema = z.object({
	email: z.string().email(),
	role: z.enum(["EDITOR", "VIEWER", "CHECKIN"]).default("VIEWER"),
});

export const UpdateMemberRoleSchema = z.object({
	role: z.enum(["EDITOR", "VIEWER", "CHECKIN"]),
});
