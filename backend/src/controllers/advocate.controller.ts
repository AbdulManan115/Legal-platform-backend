import type { Request, Response } from "express";
import { AppError } from "../utils/AppError";
import {
  createAdvocateProfileSchema,
  updateAdvocateProfileSchema,
  updateAvailabilitySchema,
} from "../validators/advocate.validators";
import {
  createAdvocateProfile,
  getMyAdvocateProfile,
  updateMyAdvocateProfile,
  updateMyAvailability,
} from "../services/advocate.service";

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

export const createProfile = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  const result = createAdvocateProfileSchema.safeParse(
    req.body,
  );

  if (!result.success) {
    throw new AppError(
      400,
      "Validation failed",
      result.error.issues,
    );
  }

  const profile = await createAdvocateProfile(
    getUserId(req),
    result.data,
  );

  res.status(201).json({
    success: true,
    message: "Advocate profile created successfully",
    data: {
      profile,
    },
  });
};

export const getMyProfile = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  const profile = await getMyAdvocateProfile(
    getUserId(req),
  );

  res.status(200).json({
    success: true,
    data: {
      profile,
    },
  });
};

export const updateMyProfile = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  const result = updateAdvocateProfileSchema.safeParse(
    req.body,
  );

  if (!result.success) {
    throw new AppError(
      400,
      "Validation failed",
      result.error.issues,
    );
  }

  const profile = await updateMyAdvocateProfile(
    getUserId(req),
    result.data,
  );

  res.status(200).json({
    success: true,
    message: "Advocate profile updated successfully",
    data: {
      profile,
    },
  });
};

export const updateAvailability = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  const result = updateAvailabilitySchema.safeParse(
    req.body,
  );

  if (!result.success) {
    throw new AppError(
      400,
      "Validation failed",
      result.error.issues,
    );
  }

  const availability = await updateMyAvailability(
    getUserId(req),
    result.data,
  );

  res.status(200).json({
    success: true,
    message: "Availability updated successfully",
    data: {
      availability,
    },
  });
};
