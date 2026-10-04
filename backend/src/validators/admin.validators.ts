import { z } from "zod";

export const adminUserIdSchema = z.object({
  userId: z.string().regex(/^[a-f\d]{24}$/i, "Invalid user ID"),
});

export const adminUserStatusSchema = z.object({
  status: z.enum(["active", "suspended"]),
});

export const adminUserRoleSchema = z.object({
  role: z.enum(["client", "advocate", "admin"]),
});
