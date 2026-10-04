import { z } from "zod";

const objectId = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, "Invalid ID");

export const createHearingSchema = z.object({
  caseId: objectId,
  court: z.string().trim().min(2).max(200),
  judge: z.string().trim().max(150).optional(),
  dateTime: z.coerce.date(),
  notes: z.string().trim().max(3000).optional(),
  status: z
    .enum([
      "scheduled",
      "completed",
      "adjourned",
      "cancelled",
    ])
    .default("scheduled"),
});

export const updateHearingSchema = z.object({
  court: z.string().trim().min(2).max(200).optional(),
  judge: z.string().trim().max(150).optional(),
  dateTime: z.coerce.date().optional(),
  notes: z.string().trim().max(3000).optional(),
  status: z
    .enum([
      "scheduled",
      "completed",
      "adjourned",
      "cancelled",
    ])
    .optional(),
});

export const hearingIdSchema = z.object({
  hearingId: objectId,
});

export type CreateHearingInput = z.infer<
  typeof createHearingSchema
>;

export type UpdateHearingInput = z.infer<
  typeof updateHearingSchema
>;
