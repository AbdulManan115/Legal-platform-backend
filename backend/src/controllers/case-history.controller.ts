import type { Request, Response } from "express";
import { AppError } from "../utils/AppError";
import {
  caseHistoryCaseIdSchema,
  createCaseHistorySchema,
} from "../validators/case-history.validators";
import {
  addCaseHistory,
  getCaseHistory,
} from "../services/case-history.service";

interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    role: "client" | "advocate" | "admin";
  };
}

const getUserId = (req: AuthenticatedRequest): string => {
  if (!req.user) {
    throw new AppError(401, "Authentication required");
  }

  return req.user.userId;
};

export const create = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  const result = createCaseHistorySchema.safeParse(req.body);

  if (!result.success) {
    throw new AppError(
      400,
      "Validation failed",
      result.error.issues,
    );
  }

  const history = await addCaseHistory(
    getUserId(req),
    result.data,
  );

  res.status(201).json({
    success: true,
    message: "Case history added successfully",
    data: { history },
  });
};

export const mine = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  const result = caseHistoryCaseIdSchema.safeParse(req.params);

  if (!result.success) {
    throw new AppError(400, "Invalid case ID");
  }

  const history = await getCaseHistory(
    getUserId(req),
    result.data.caseId,
  );

  res.status(200).json({
    success: true,
    data: { history },
  });
};
