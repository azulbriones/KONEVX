import { Router } from "express";
import {
	addEventMemberHandler,
	listEventMembersHandler,
	removeEventMemberHandler,
	updateEventMemberRoleHandler,
} from "../controllers/eventMembers.controller.js";
import { requireEventAdmin, requireEventView } from "../lib/eventAccess.js";
import { requireAuth, requireCsrf } from "../middlewares/auth.js";
import { writeLimiter } from "../middlewares/rateLimiters.js";

export const eventMembersRouter = Router({ mergeParams: true });

eventMembersRouter.get(
	"/",
	requireAuth,
	requireEventView,
	listEventMembersHandler,
);

eventMembersRouter.post(
	"/",
	writeLimiter,
	requireAuth,
	requireCsrf,
	requireEventAdmin,
	addEventMemberHandler,
);

eventMembersRouter.patch(
	"/:userId",
	writeLimiter,
	requireAuth,
	requireCsrf,
	requireEventAdmin,
	updateEventMemberRoleHandler,
);

eventMembersRouter.delete(
	"/:userId",
	writeLimiter,
	requireAuth,
	requireCsrf,
	requireEventAdmin,
	removeEventMemberHandler,
);
