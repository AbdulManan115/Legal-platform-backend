import type { Request, Response } from "express";
import mongoose from "mongoose";
import { env } from "../config/env";

export const healthCheck = (_req: Request, res: Response): void => {
  const dbConnected = mongoose.connection.readyState === 1;

  res.status(dbConnected ? 200 : 503).json({
    success: dbConnected,
    status: dbConnected ? "ok" : "degraded",
    environment: env.NODE_ENV,
    db: dbConnected ? "connected" : "disconnected",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
};
