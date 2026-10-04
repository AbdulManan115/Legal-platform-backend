import { z } from "zod";

export const recommendationSchema = z.object({
  practiceArea: z.string().trim().max(100).optional(),
  city: z.string().trim().max(100).optional(),
});

export type RecommendationInput = z.infer<
  typeof recommendationSchema
>;
