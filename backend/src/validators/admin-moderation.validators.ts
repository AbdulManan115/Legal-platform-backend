import { z } from "zod";

export const advocateIdSchema = z.object({
  advocateId: z.string().regex(/^[a-f\d]{24}$/i, "Invalid advocate ID"),
});

export const verificationSchema = z.object({
  status: z.enum(["verified", "rejected"]),
  rejectionReason: z.string().trim().max(1000).optional(),
});

export const reviewIdSchema = z.object({
  reviewId: z.string().regex(/^[a-f\d]{24}$/i, "Invalid review ID"),
});

export const reviewModerationSchema = z.object({
  status: z.enum(["visible", "hidden"]),
});
