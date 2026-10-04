import type { Request, Response } from "express";
import { AppError } from "../utils/AppError";
import { getPublicAdvocateProfile } from "../services/advocate-public.service";

export const getPublicProfile = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const slug = req.params.slug;

  if (!slug) {
    throw new AppError(400, "Advocate slug is required");
  }

  const profile = await getPublicAdvocateProfile(slug);

  res.status(200).json({
    success: true,
    data: {
      profile,
    },
  });
};
