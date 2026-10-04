import type { NextFunction, Response } from "express";
import { AppError } from "../utils/AppError";
import type { AuthenticatedRequest } from "./auth";

type Role = "client" | "advocate" | "admin";

export const requireRole =
  (...allowedRoles: Role[]) =>
  (
    req: AuthenticatedRequest,
    _res: Response,
    next: NextFunction,
  ): void => {
    if (!req.user) {
      next(new AppError(401, "Authentication required"));
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      next(new AppError(403, "You do not have permission to access this resource"));
      return;
    }

    next();
  };
