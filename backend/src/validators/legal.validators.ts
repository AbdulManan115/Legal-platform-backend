import { z } from "zod";

export const legalCheckSchema = z.object({
  query: z
    .string()
    .trim()
    .min(3, "Please describe your legal issue")
    .max(1000, "Legal issue is too long"),
});

export const categorySlugSchema = z.object({
  slug: z
    .string()
    .trim()
    .min(1)
    .max(150),
});
