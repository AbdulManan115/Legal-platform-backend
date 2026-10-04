import type { NextFunction, Request, Response } from "express";
import { verifyAccessToken } from "../utils/jwt";
import { AppError } from "../utils/AppError";

export interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    role: "client" | "advocate" | "admin";
  };
}

export const requireAuth = (
  req: Request,
  _res: Response,
  next: NextFunction,
): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    next(new AppError(401, "Authentication required"));
    return;
  }

  const token = authHeader.slice(7).trim();

  if (!token) {
    next(new AppError(401, "Authentication required"));
    return;
  }

  try {
    const payload = verifyAccessToken(token);

    (req as AuthenticatedRequest).user = {
      userId: payload.userId,
      role: payload.role,
    };

    next();
  } catch {
    next(new AppError(401, "Invalid or expired access token"));
  }
};
