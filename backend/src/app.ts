import express from "express";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import mongoSanitize from "express-mongo-sanitize";

import { corsMiddleware } from "./config/cors";
import { apiRateLimiter } from "./middleware/rateLimiter";
import { notFound } from "./middleware/notFound";
import { errorHandler } from "./middleware/errorHandler";
import routes from "./routes";

export const app = express();

if (process.env.NODE_ENV === "production") {
  app.set("trust proxy", 1);
}

app.use(helmet());
app.use(corsMiddleware);

app.use("/api", apiRateLimiter);

app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());

app.use(mongoSanitize());

app.use("/api", routes);

app.use(notFound);
app.use(errorHandler);
