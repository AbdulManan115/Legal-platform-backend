import type { Response } from "express";
import type { AuthenticatedRequest } from "../middleware/auth";
import { AppError } from "../utils/AppError";

import {
  getDashboardStats,
  listUsers,
  updateUserStatus,
  updateUserRole,
  listPendingAdvocates,
  updateAdvocateVerification,
  listReviewsForModeration,
  updateReviewModeration,
} from "../services/admin.service.js";

import {
  adminUserIdSchema,
  adminUserStatusSchema,
  adminUserRoleSchema,
} from "../validators/admin.validators";

import {
  advocateIdSchema,
  verificationSchema,
  reviewIdSchema,
  reviewModerationSchema,
} from "../validators/admin-moderation.validators";

const ensureAdmin = (req: AuthenticatedRequest): void => {
  if (!req.user) {
    throw new AppError(401, "Authentication required");
  }

  if (req.user.role !== "admin") {
    throw new AppError(403, "Admin access required");
  }
};

export const dashboardStats = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  ensureAdmin(req);

  const stats = await getDashboardStats();

  res.status(200).json({
    success: true,
    data: stats,
  });
};

export const users = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  ensureAdmin(req);

  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(req.query.limit) || 20, 1), 100);

  const role =
    typeof req.query.role === "string" ? req.query.role : undefined;

  const status =
    typeof req.query.status === "string" ? req.query.status : undefined;

  const search =
    typeof req.query.search === "string" ? req.query.search : undefined;

  const result = await listUsers(page, limit, role, status, search);

  res.status(200).json({
    success: true,
    ...result,
  });
};

export const changeUserStatus = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  ensureAdmin(req);

  const params = adminUserIdSchema.safeParse(req.params);

  if (!params.success) {
    throw new AppError(400, "Invalid user ID");
  }

  const body = adminUserStatusSchema.safeParse(req.body);

  if (!body.success) {
    throw new AppError(400, "Invalid user status");
  }

  const user = await updateUserStatus(
    params.data.userId,
    body.data.status,
  );

  res.status(200).json({
    success: true,
    message: "User status updated",
    data: user,
  });
};

export const changeUserRole = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  ensureAdmin(req);

  const params = adminUserIdSchema.safeParse(req.params);

  if (!params.success) {
    throw new AppError(400, "Invalid user ID");
  }

  const body = adminUserRoleSchema.safeParse(req.body);

  if (!body.success) {
    throw new AppError(400, "Invalid user role");
  }

  const user = await updateUserRole(
    params.data.userId,
    body.data.role,
  );

  res.status(200).json({
    success: true,
    message: "User role updated",
    data: user,
  });
};

export const pendingAdvocates = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  ensureAdmin(req);

  const advocates = await listPendingAdvocates();

  res.status(200).json({
    success: true,
    data: advocates,
  });
};

export const verifyAdvocate = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  ensureAdmin(req);

  const params = advocateIdSchema.safeParse(req.params);

  if (!params.success) {
    throw new AppError(400, "Invalid advocate ID");
  }

  const body = verificationSchema.safeParse(req.body);

  if (!body.success) {
    throw new AppError(400, "Invalid verification data");
  }

  const profile = await updateAdvocateVerification(
    params.data.advocateId,
    body.data.status,
    body.data.rejectionReason,
    req.user?.userId,
  );

  res.status(200).json({
    success: true,
    message: `Advocate ${body.data.status}`,
    data: profile,
  });
};

export const moderationReviews = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  ensureAdmin(req);

  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(req.query.limit) || 20, 1), 100);

  const status =
    req.query.status === "visible" || req.query.status === "hidden"
      ? req.query.status
      : undefined;

  const result = await listReviewsForModeration(
    page,
    limit,
    status,
  );

  res.status(200).json({
    success: true,
    ...result,
  });
};

export const moderateReview = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  ensureAdmin(req);

  const params = reviewIdSchema.safeParse(req.params);

  if (!params.success) {
    throw new AppError(400, "Invalid review ID");
  }

  const body = reviewModerationSchema.safeParse(req.body);

  if (!body.success) {
    throw new AppError(400, "Invalid moderation status");
  }

  const review = await updateReviewModeration(
    params.data.reviewId,
    body.data.status,
  );

  res.status(200).json({
    success: true,
    message: `Review ${body.data.status}`,
    data: review,
  });
};

export const legalCategories = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  ensureAdmin(req);

  const { listLegalCategoriesAdmin } =
    await import("../services/admin.service.js");

  const categories = await listLegalCategoriesAdmin();

  res.status(200).json({
    success: true,
    data: categories,
  });
};

export const createCategory = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  ensureAdmin(req);

  const { createCategorySchema } =
    await import("../validators/admin-legal.validators.js");

  const parsed = createCategorySchema.safeParse(req.body);

  if (!parsed.success) {
    throw new AppError(400, "Invalid legal category data");
  }

  const { createLegalCategory } =
    await import("../services/admin.service.js");

  const category = await createLegalCategory(parsed.data);

  res.status(201).json({
    success: true,
    message: "Legal category created",
    data: category,
  });
};

export const editCategory = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  ensureAdmin(req);

  const { categoryIdSchema, updateCategorySchema } =
    await import("../validators/admin-legal.validators.js");

  const params = categoryIdSchema.safeParse(req.params);
  const body = updateCategorySchema.safeParse(req.body);

  if (!params.success) {
    throw new AppError(400, "Invalid category ID");
  }

  if (!body.success) {
    throw new AppError(400, "Invalid category data");
  }

  const { updateLegalCategory } =
    await import("../services/admin.service.js");

  const category = await updateLegalCategory(
    params.data.categoryId,
    body.data,
  );

  res.status(200).json({
    success: true,
    message: "Legal category updated",
    data: category,
  });
};

export const removeCategory = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  ensureAdmin(req);

  const { categoryIdSchema } =
    await import("../validators/admin-legal.validators.js");

  const params = categoryIdSchema.safeParse(req.params);

  if (!params.success) {
    throw new AppError(400, "Invalid category ID");
  }

  const { deleteLegalCategory } =
    await import("../services/admin.service.js");

  await deleteLegalCategory(params.data.categoryId);

  res.status(200).json({
    success: true,
    message: "Legal category deleted",
  });
};

export const legalProvisions = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  ensureAdmin(req);

  const { listLegalProvisionsAdmin } =
    await import("../services/admin.service.js");

  const provisions = await listLegalProvisionsAdmin();

  res.status(200).json({
    success: true,
    data: provisions,
  });
};

export const createProvision = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  ensureAdmin(req);

  const { createProvisionSchema } =
    await import("../validators/admin-legal.validators.js");

  const parsed = createProvisionSchema.safeParse(req.body);

  if (!parsed.success) {
    throw new AppError(400, "Invalid legal provision data");
  }

  const { createLegalProvision } =
    await import("../services/admin.service.js");

  const provision = await createLegalProvision(parsed.data);

  res.status(201).json({
    success: true,
    message: "Legal provision created",
    data: provision,
  });
};

export const editProvision = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  ensureAdmin(req);

  const { provisionIdSchema, updateProvisionSchema } =
    await import("../validators/admin-legal.validators.js");

  const params = provisionIdSchema.safeParse(req.params);
  const body = updateProvisionSchema.safeParse(req.body);

  if (!params.success) {
    throw new AppError(400, "Invalid provision ID");
  }

  if (!body.success) {
    throw new AppError(400, "Invalid provision data");
  }

  const { updateLegalProvision } =
    await import("../services/admin.service.js");

  const provision = await updateLegalProvision(
    params.data.provisionId,
    body.data,
  );

  res.status(200).json({
    success: true,
    message: "Legal provision updated",
    data: provision,
  });
};

export const removeProvision = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  ensureAdmin(req);

  const { provisionIdSchema } =
    await import("../validators/admin-legal.validators.js");

  const params = provisionIdSchema.safeParse(req.params);

  if (!params.success) {
    throw new AppError(400, "Invalid provision ID");
  }

  const { deleteLegalProvision } =
    await import("../services/admin.service.js");

  await deleteLegalProvision(params.data.provisionId);

  res.status(200).json({
    success: true,
    message: "Legal provision deleted",
  });
};
