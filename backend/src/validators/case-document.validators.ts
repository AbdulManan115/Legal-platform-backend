import { z } from "zod";

const objectId = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, "Invalid ID");

export const uploadDocumentSchema = z.object({
  caseId: objectId,
  category: z
    .enum([
      "fir",
      "evidence",
      "application",
      "court_order",
      "agreement",
      "other",
    ])
    .default("other"),
});

export const documentIdSchema = z.object({
  documentId: objectId,
});

export const documentCaseIdSchema = z.object({
  caseId: objectId,
});

export type UploadDocumentInput = z.infer<
  typeof uploadDocumentSchema
>;
