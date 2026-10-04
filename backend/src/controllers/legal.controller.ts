import type { Request, Response } from "express";
import {
  checkLegalIssue,
  getCategoryProvisions,
  getLegalCategories,
} from "../services/legal-checker.service";
import {
  categorySlugSchema,
  legalCheckSchema,
} from "../validators/legal.validators";
import { AppError } from "../utils/AppError";

export const checkIssue = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const parsed = legalCheckSchema.safeParse(req.body);

  if (!parsed.success) {
    throw new AppError(400, "Invalid legal issue query", parsed.error.flatten());
  }

  const result = await checkLegalIssue(parsed.data.query);

  res.status(200).json({
    success: true,
    data: result,
  });
};

export const listCategories = async (
  _req: Request,
  res: Response,
): Promise<void> => {
  const categories = await getLegalCategories();

  res.status(200).json({
    success: true,
    data: categories,
  });
};

export const categoryProvisions = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const parsed = categorySlugSchema.safeParse(req.params);

  if (!parsed.success) {
    throw new AppError(400, "Invalid category slug");
  }

  const result = await getCategoryProvisions(parsed.data.slug);

  res.status(200).json({
    success: true,
    data: result,
  });
};
