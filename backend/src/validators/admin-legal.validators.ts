import { z } from "zod";

export const categoryIdSchema = z.object({
  categoryId: z.string().regex(/^[a-f\d]{24}$/i, "Invalid category ID"),
});

export const provisionIdSchema = z.object({
  provisionId: z.string().regex(/^[a-f\d]{24}$/i, "Invalid provision ID"),
});

export const createCategorySchema = z.object({
  name: z.string().trim().min(2).max(150),
  slug: z.string().trim().min(2).max(150).regex(/^[a-z0-9-]+$/),
  description: z.string().trim().min(2).max(1000),
  icon: z.string().trim().max(100).optional(),
  keywords: z.array(z.string().trim().min(1)).default([]),
  synonyms: z.array(z.string().trim().min(1)).default([]),
  isActive: z.boolean().default(true),
});

export const updateCategorySchema = createCategorySchema.partial();

export const createProvisionSchema = z.object({
  category: z.string().regex(/^[a-f\d]{24}$/i, "Invalid category ID"),
  lawName: z.string().trim().min(2).max(200),
  section: z.string().trim().min(1).max(100),
  title: z.string().trim().min(2).max(300),
  plainExplanation: z.string().trim().min(2).max(3000),
  keywords: z.array(z.string().trim().min(1)).default([]),
  isActive: z.boolean().default(true),
});

export const updateProvisionSchema = createProvisionSchema.partial();
