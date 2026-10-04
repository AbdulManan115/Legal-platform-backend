import { Router } from "express";
import {
  getNotifications,
  unreadCount,
  markRead,
  markAllRead,
} from "../controllers/notification.controller";
import { requireAuth } from "../middleware/auth";

const router = Router();

router.use(requireAuth);

router.get("/", getNotifications);
router.get("/unread-count", unreadCount);
router.patch("/read-all", markAllRead);
router.patch("/:notificationId/read", markRead);

export default router;
