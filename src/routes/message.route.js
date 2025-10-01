import express from "express";
import {
  getAllContacts,
  getChatPartners,
  getMessagesByUserId,
  sendMessage,
} from "../controllers/message.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";
import { messageLimiter, fetchLimiter } from "../middleware/rateLimiter.js";
// import { arcjetProtection } from "../middleware/arcjet.middleware.js";

const router = express.Router();

// the middlewares execute in order - so requests get rate-limited first, then authenticated.
// this is actually more efficient since unauthenticated requests get blocked by rate limiting before hitting the auth middleware.
// router.use(arcjetProtection, protectRoute);

// Apply rate limiting and authentication to message routes
// GET routes use fetchLimiter (60 requests per 15 minutes)
router.get("/contacts", fetchLimiter, protectRoute, getAllContacts);
router.get("/chats", fetchLimiter, protectRoute, getChatPartners);
router.get("/:id", fetchLimiter, protectRoute, getMessagesByUserId);

// POST routes use messageLimiter (30 messages per 15 minutes)
router.post("/send/:id", messageLimiter, protectRoute, sendMessage);

export default router;