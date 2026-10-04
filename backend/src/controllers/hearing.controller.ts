import type { Request, Response } from "express";
import { AppError } from "../utils/AppError";
import {
  createHearingSchema,
  hearingIdSchema,
  updateHearingSchema,
} from "../validators/hearing.validators";
import {
  createHearing,
  deleteHearing,
  getCaseHearings,
  getUpcomingHearings,
  updateHearing,
} from "../services/hearing.service";

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

const getHearingId = (
  req: AuthenticatedRequest,
): string => {
  const result = hearingIdSchema.safeParse(req.params);

  if (!result.success) {
    throw new AppError(400, "Invalid hearing ID");
  }

  return result.data.hearingId;
};

export const create = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  const result = createHearingSchema.safeParse(req.body);

  if (!result.success) {
    throw new AppError(
      400,
      "Validation failed",
      result.error.issues,
    );
  }

  const hearing = await createHearing(
    getUserId(req),
    result.data,
  );

  res.status(201).json({
    success: true,
    message: "Hearing created successfully",
    data: { hearing },
  });
};

export const caseMine = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  const caseId = req.params.caseId;

  if (!/^[0-9a-fA-F]{24}$/.test(caseId)) {
    throw new AppError(400, "Invalid case ID");
  }

  const hearings = await getCaseHearings(
    getUserId(req),
    caseId,
  );

  res.status(200).json({
    success: true,
    data: { hearings },
  });
};

export const upcoming = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  const hearings = await getUpcomingHearings(
    getUserId(req),
  );

  res.status(200).json({
    success: true,
    data: { hearings },
  });
};

export const update = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  const result = updateHearingSchema.safeParse(req.body);

  if (!result.success) {
    throw new AppError(
      400,
      "Validation failed",
      result.error.issues,
    );
  }

  const hearing = await updateHearing(
    getUserId(req),
    getHearingId(req),
    result.data,
  );

  res.status(200).json({
    success: true,
    message: "Hearing updated successfully",
    data: { hearing },
  });
};

export const remove = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  await deleteHearing(
    getUserId(req),
    getHearingId(req),
  );

  res.status(200).json({
    success: true,
    message: "Hearing deleted successfully",
  });
};
