import { z } from "zod";

export const advocateSearchSchema = z.object({
  q: z.string().trim().max(100).optional(),
  city: z.string().trim().max(100).optional(),
  province: z.string().trim().max(100).optional(),
  practiceArea: z.string().trim().max(100).optional(),
  consultationMode: z
    .enum(["online", "in_person", "both"])
    .optional(),
  minExperience: z.coerce.number().min(0).max(70).optional(),
  maxExperience: z.coerce.number().min(0).max(70).optional(),
  minRating: z.coerce.number().min(0).max(5).optional(),
  sort: z
    .enum(["rating", "experience", "fee_low", "fee_high", "newest"])
    .default("rating"),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(12),
});

export type AdvocateSearchInput = z.infer<
  typeof advocateSearchSchema
>;
