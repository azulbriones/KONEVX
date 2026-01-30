import { Router } from "express";
import { getPublicEventBySlugHandler } from "../controllers/public.controller.js";

export const publicRouter = Router();

// GET /api/public/events/:slug
publicRouter.get("/events/:slug", getPublicEventBySlugHandler);
