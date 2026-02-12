import { z } from "zod";

export const SetPublishSchema = z.object({
	isPublished: z.boolean(),
});
