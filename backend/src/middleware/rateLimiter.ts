import rateLimit from "express-rate-limit";

const isProduction = process.env.NODE_ENV === "production";

export const apiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,

  // Development mein high limit, production mein proper protection
  max: isProduction ? 300 : 5000,

  standardHeaders: true,
  legacyHeaders: false,

  message: {
    success: false,
    message: "Too many requests, please try again later.",
  },

  skip: () => !isProduction,
});
