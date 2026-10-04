import type { Request, Response } from "express";
import { AppError } from "../utils/AppError";
import { recommendationSchema } from "../validators/recommendation.validators";
import { getRecommendedAdvocates } from "../services/recommendation.service";

export const getRecommendations = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const result = recommendationSchema.safeParse(req.query);

  if (!result.success) {
    throw new AppError(
      400,
      "Invalid recommendation parameters",
      result.error.issues,
    );
  }

  const recommendations = await getRecommendedAdvocates(
    result.data,
  );

  res.status(200).json({
    success: true,
    data: {
      recommendations,
    },
  });
};
