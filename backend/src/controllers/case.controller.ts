import type { Request, Response } from "express";
import { AppError } from "../utils/AppError";
import {
  caseIdSchema,
  createCaseSchema,
  updateCaseSchema,
} from "../validators/case.validators";
import {
  createCase,
  deleteCase,
  getCase,
  getMyCases,
  updateCase,
} from "../services/case.service";

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

const getCaseId = (
  req: AuthenticatedRequest,
): string => {
  const result = caseIdSchema.safeParse(req.params);

  if (!result.success) {
    throw new AppError(400, "Invalid case ID");
  }

  return result.data.caseId;
};

export const create = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  const result = createCaseSchema.safeParse(req.body);

  if (!result.success) {
    throw new AppError(
      400,
      "Validation failed",
      result.error.issues,
    );
  }

  const legalCase = await createCase(
    getUserId(req),
    result.data,
  );

  res.status(201).json({
    success: true,
    message: "Case created successfully",
    data: { case: legalCase },
  });
};

export const mine = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  const cases = await getMyCases(getUserId(req));

  res.status(200).json({
    success: true,
    data: { cases },
  });
};

export const getOne = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  const legalCase = await getCase(
    getUserId(req),
    getCaseId(req),
  );

  res.status(200).json({
    success: true,
    data: { case: legalCase },
  });
};

export const update = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  const result = updateCaseSchema.safeParse(req.body);

  if (!result.success) {
    throw new AppError(
      400,
      "Validation failed",
      result.error.issues,
    );
  }

  const legalCase = await updateCase(
    getUserId(req),
    getCaseId(req),
    result.data,
  );

  res.status(200).json({
    success: true,
    message: "Case updated successfully",
    data: { case: legalCase },
  });
};

export const remove = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  await deleteCase(
    getUserId(req),
    getCaseId(req),
  );

  res.status(200).json({
    success: true,
    message: "Case deleted successfully",
  });
};
