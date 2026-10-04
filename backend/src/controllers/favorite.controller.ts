import type { Request, Response } from "express";
import { AppError } from "../utils/AppError";
import {
  getSavedAdvocates,
  saveAdvocate,
  unsaveAdvocate,
} from "../services/favorite.service";

interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    role: "client" | "advocate" | "admin";
  };
}

const getClientId = (
  req: AuthenticatedRequest,
): string => {
  if (!req.user) {
    throw new AppError(401, "Authentication required");
  }

  return req.user.userId;
};

export const save = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  const clientId = getClientId(req);
  const { advocateId } = req.params;

  if (!advocateId) {
    throw new AppError(400, "Advocate ID is required");
  }

  await saveAdvocate(clientId, advocateId);

  res.status(201).json({
    success: true,
    message: "Advocate saved successfully",
  });
};

export const remove = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  const clientId = getClientId(req);
  const { advocateId } = req.params;

  if (!advocateId) {
    throw new AppError(400, "Advocate ID is required");
  }

  await unsaveAdvocate(clientId, advocateId);

  res.status(200).json({
    success: true,
    message: "Advocate removed from saved list",
  });
};

export const list = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  const clientId = getClientId(req);

  const savedAdvocates = await getSavedAdvocates(
    clientId,
  );

  res.status(200).json({
    success: true,
    data: {
      savedAdvocates,
    },
  });
};
