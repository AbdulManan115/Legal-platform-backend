import type { Response } from "express";
import type { AuthenticatedRequest } from "../middleware/auth";
import {
  getUnreadCount,
  listNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "../services/notification.service";
import { notificationIdSchema } from "../validators/notification.validators";
import { AppError } from "../utils/AppError";

const getUserId = (req: AuthenticatedRequest): string => {
  if (!req.user) {
    throw new AppError(401, "Authentication required");
  }

  return req.user.userId;
};

export const getNotifications = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  const userId = getUserId(req);

  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(req.query.limit) || 20, 1), 50);

  const result = await listNotifications(userId, page, limit);

  res.status(200).json({
    success: true,
    ...result,
  });
};

export const unreadCount = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  const userId = getUserId(req);
  const count = await getUnreadCount(userId);

  res.status(200).json({
    success: true,
    count,
  });
};

export const markRead = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  const userId = getUserId(req);

  const parsed = notificationIdSchema.safeParse(req.params);

  if (!parsed.success) {
    throw new AppError(400, "Invalid notification ID");
  }

  await markNotificationRead(userId, parsed.data.notificationId);

  res.status(200).json({
    success: true,
    message: "Notification marked as read",
  });
};

export const markAllRead = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  const userId = getUserId(req);

  await markAllNotificationsRead(userId);

  res.status(200).json({
    success: true,
    message: "All notifications marked as read",
  });
};
