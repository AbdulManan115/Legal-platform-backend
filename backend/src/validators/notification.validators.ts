import { z } from "zod";

export const notificationIdSchema = z.object({
  notificationId: z.string().regex(/^[a-f\d]{24}$/i, "Invalid notification ID"),
});
