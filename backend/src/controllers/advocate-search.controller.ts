import type { Request, Response } from "express";
import { advocateSearchSchema } from "../validators/advocate-search.validators";
import { searchAdvocates } from "../services/advocate-search.service";
import { AppError } from "../utils/AppError";

export const search = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const result = advocateSearchSchema.safeParse(req.query);

  if (!result.success) {
    throw new AppError(
      400,
      "Invalid search parameters",
      result.error.issues,
    );
  }

  const data = await searchAdvocates(result.data);

  res.status(200).json({
    success: true,
    data,
  });
};
