import { Router } from "express";
import {
	addEventMemberHandler,
	listEventMembersHandler,
	removeEventMemberHandler,
	updateEventMemberRoleHandler,
} from "../controllers/eventMembers.controller.js";
import { requireAuth, requireCsrf } from "../middlewares/auth.js";
import {
	requireEventRead,
	requireEventWrite,
} from "../middlewares/eventAccess.js";
import { writeLimiter } from "../middlewares/rateLimiters.js";

export const eventMembersRouter = Router({ mergeParams: true });

// GET /api/events/:eventId/members (read)
eventMembersRouter.get(
	"/",
	requireAuth,
	requireEventRead,
	listEventMembersHandler,
);

// POST /api/events/:eventId/members (write)
eventMembersRouter.post(
	"/",
	writeLimiter,
	requireAuth,
	requireCsrf,
	requireEventWrite,
	addEventMemberHandler,
);

// PATCH /api/events/:eventId/members/:userId (write)
eventMembersRouter.patch(
	"/:userId",
	writeLimiter,
	requireAuth,
	requireCsrf,
	requireEventWrite,
	updateEventMemberRoleHandler,
);

// DELETE /api/events/:eventId/members/:userId (write)
eventMembersRouter.delete(
	"/:userId",
	writeLimiter,
	requireAuth,
	requireCsrf,
	requireEventWrite,
	removeEventMemberHandler,
);
