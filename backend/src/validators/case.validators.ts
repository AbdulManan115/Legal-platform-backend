import { z } from "zod";

const objectId = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, "Invalid ID");

export const createCaseSchema = z.object({
  clientId: objectId,
  caseNumber: z.string().trim().max(100).optional(),
  title: z.string().trim().min(3).max(200),
  caseType: z.string().trim().min(2).max(100),
  court: z.string().trim().min(2).max(200),
  judge: z.string().trim().max(150).optional(),
  oppositeParty: z.string().trim().max(200).optional(),
  description: z.string().trim().max(3000).optional(),
  filingDate: z.coerce.date().optional(),
  status: z
    .enum(["active", "pending", "closed", "urgent"])
    .default("pending"),
  importantNotes: z.string().trim().max(3000).optional(),
});

export const updateCaseSchema = z.object({
  caseNumber: z.string().trim().max(100).optional(),
  title: z.string().trim().min(3).max(200).optional(),
  caseType: z.string().trim().min(2).max(100).optional(),
  court: z.string().trim().min(2).max(200).optional(),
  judge: z.string().trim().max(150).optional(),
  oppositeParty: z.string().trim().max(200).optional(),
  description: z.string().trim().max(3000).optional(),
  filingDate: z.coerce.date().optional(),
  status: z
    .enum(["active", "pending", "closed", "urgent"])
    .optional(),
  importantNotes: z.string().trim().max(3000).optional(),
});

export const caseIdSchema = z.object({
  caseId: objectId,
});

export type CreateCaseInput = z.infer<typeof createCaseSchema>;
export type UpdateCaseInput = z.infer<typeof updateCaseSchema>;
