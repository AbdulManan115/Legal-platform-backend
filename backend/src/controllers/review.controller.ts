import type { Response } from "express";
import type { AuthenticatedRequest } from "../middleware/auth";
import {
  createReviewSchema,
  advocateReviewsQuerySchema,
} from "../validators/review.validators";
import {
  createReview,
  getAdvocateReviews,
  getReviewByAppointment,
} from "../services/review.service";
import { AppError } from "../utils/AppError";

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
  const body = createReviewSchema.safeParse(req.body);

  if (!body.success) {
    throw new AppError(400, "Invalid review data");
  }

  const review = await createReview(getUserId(req), body.data);

  res.status(201).json({
    success: true,
    message: "Review submitted successfully",
    data: review,
  });
};

export const advocateReviews = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  const query = advocateReviewsQuerySchema.safeParse(req.query);

  if (!query.success) {
    throw new AppError(400, "Invalid pagination");
  }

  const result = await getAdvocateReviews(
    req.params.advocateId,
    query.data.page,
    query.data.limit,
  );

  res.status(200).json({
    success: true,
    data: result,
  });
};

export const appointmentReview = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  const review = await getReviewByAppointment(
    getUserId(req),
    req.params.appointmentId,
  );

  res.status(200).json({
    success: true,
    data: review,
  });
};
