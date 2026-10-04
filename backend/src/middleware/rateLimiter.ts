import rateLimit from "express-rate-limit";
import { env } from "../config/env";

export const apiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: env.RATE_LIMIT_MAX,
  standardHeaders: "draft-7",
  legacyHeaders: false,

  skip: (req) => req.path === "/health",

  message: {
    success: false,
    message: "Too many requests. Please try again later.",
  },
});
