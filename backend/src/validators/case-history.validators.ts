import { z } from "zod";

const objectId = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, "Invalid ID");

export const createCaseHistorySchema = z.object({
  caseId: objectId,
  type: z
    .enum([
      "created",
      "updated",
      "status_changed",
      "note_added",
      "hearing_updated",
      "document_added",
      "custom",
    ])
    .default("custom"),
  message: z.string().trim().min(2).max(2000),
});

export const caseHistoryCaseIdSchema = z.object({
  caseId: objectId,
});

export type CreateCaseHistoryInput = z.infer<
  typeof createCaseHistorySchema
>;
