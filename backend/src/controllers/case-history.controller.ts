import type { Request, Response } from "express";
import { AppError } from "../utils/AppError";
import {
  caseHistoryCaseIdSchema,
  caseHistoryIdSchema,
  createCaseHistorySchema,
  updateCaseHistorySchema,
} from "../validators/case-history.validators";
import {
  addCaseHistory,
  deleteCaseHistory,
  getCaseHistory,
  updateCaseHistory,
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


export const update = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  const idResult = caseHistoryIdSchema.safeParse(req.params);

  if (!idResult.success) {
    throw new AppError(400, "Invalid history ID");
  }

  const bodyResult = updateCaseHistorySchema.safeParse(req.body);

  if (!bodyResult.success) {
    throw new AppError(
      400,
      "Validation failed",
      bodyResult.error.issues,
    );
  }

  const history = await updateCaseHistory(
    getUserId(req),
    idResult.data.historyId,
    bodyResult.data,
  );

  res.status(200).json({
    success: true,
    message: "Case history updated successfully",
    data: { history },
  });
};

export const remove = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  const result = caseHistoryIdSchema.safeParse(req.params);

  if (!result.success) {
    throw new AppError(400, "Invalid history ID");
  }

  await deleteCaseHistory(
    getUserId(req),
    result.data.historyId,
  );

  res.status(200).json({
    success: true,
    message: "Case history deleted successfully",
  });
};
