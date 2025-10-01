import rateLimit from "express-rate-limit";

// General API rate limiter - 100 requests per 15 minutes per IP
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per window
  message: {
    message: "Too many requests from this IP, please try again later",
  },
  standardHeaders: true, // return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false,  // disable `X-RateLimit-*` headers
});

// Stricter rate limiter for authentication routes - 5 attempts per 15 minutes
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 auth requests per window
  message: {
    message: "Too many authentication attempts, please try again later",
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // don't count successful requests
});

// Very strict rate limiter for login attempts - 3 attempts per 15 minutes
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 3, // limit each IP to 3 login attempts per window
  message: {
    message: "Too many login attempts, please try again later",
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // don't count successful logins
});

// Rate limiter for message sending - 30 messages per 15 minutes
export const messageLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // limit each IP to 30 messages per window
  message: {
    message: "Too many messages sent, please slow down",
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false, // count all messages
});

// Rate limiter for fetching messages/contacts - 60 requests per 15 minutes
export const fetchLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 60, // limit each IP to 60 fetch requests per window
  message: {
    message: "Too many requests for chat data, please slow down",
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false, // count all requests
});
