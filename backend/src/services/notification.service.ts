import { Types } from "mongoose";
import { Notification, NotificationType } from "../models/Notification";
import { AppError } from "../utils/AppError";

interface CreateNotificationInput {
  userId: Types.ObjectId | string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
}

export const createNotification = async (
  input: CreateNotificationInput,
): Promise<void> => {
  await Notification.create({
    user: input.userId,
    type: input.type,
    title: input.title,
    message: input.message,
    link: input.link,
  });
};

export const listNotifications = async (
  userId: string,
  page = 1,
  limit = 20,
) => {
  const skip = (page - 1) * limit;

  const [notifications, total] = await Promise.all([
    Notification.find({ user: userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),

    Notification.countDocuments({ user: userId }),
  ]);

  return {
    notifications,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const getUnreadCount = async (userId: string): Promise<number> => {
  return Notification.countDocuments({
    user: userId,
    isRead: false,
  });
};

export const markNotificationRead = async (
  userId: string,
  notificationId: string,
): Promise<void> => {
  const notification = await Notification.findOneAndUpdate(
    {
      _id: notificationId,
      user: userId,
    },
    {
      $set: {
        isRead: true,
        readAt: new Date(),
      },
    },
  );

  if (!notification) {
    throw new AppError(404, "Notification not found");
  }
};

export const markAllNotificationsRead = async (
  userId: string,
): Promise<void> => {
  await Notification.updateMany(
    {
      user: userId,
      isRead: false,
    },
    {
      $set: {
        isRead: true,
        readAt: new Date(),
      },
    },
  );
};
