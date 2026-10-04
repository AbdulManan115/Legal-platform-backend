import { z } from "zod";

const weeklyAvailabilitySchema = z.object({
  day: z.number().int().min(0).max(6),
  enabled: z.boolean(),
  startTime: z.string().regex(/^\d{2}:\d{2}$/),
  endTime: z.string().regex(/^\d{2}:\d{2}$/),
});

const blockedDateSchema = z.object({
  date: z.coerce.date(),
  reason: z.string().trim().max(300).optional(),
});

export const createAdvocateProfileSchema = z.object({
  slug: z.string().trim().min(3).max(100).regex(/^[a-z0-9-]+$/),
  headline: z.string().trim().max(200).optional(),
  bio: z.string().trim().max(3000).optional(),
  city: z.string().trim().min(2).max(100),
  province: z.string().trim().min(2).max(100),
  address: z.string().trim().max(300).optional(),
  publicPhone: z.string().trim().max(30).optional(),
  publicEmail: z.string().trim().email().max(254).optional(),
  qualification: z.string().trim().min(2).max(300),
  experienceYears: z.number().min(0).max(70),
  practiceAreas: z.array(z.string().trim().min(2).max(100)).min(1),
  barCouncil: z.string().trim().max(200).optional(),
  licenseNumber: z.string().trim().max(100).optional(),
  consultationFee: z.number().min(0).optional(),
  consultationModes: z
    .array(z.enum(["online", "in_person", "both"]))
    .min(1),
});

export const updateAdvocateProfileSchema =
  createAdvocateProfileSchema.partial().extend({
    slug: z.string().trim().min(3).max(100).regex(/^[a-z0-9-]+$/).optional(),
  });

export const updateAvailabilitySchema = z.object({
  slotDurationMins: z.number().int().min(15).max(180).optional(),
  weekly: z.array(weeklyAvailabilitySchema).optional(),
  blockedDates: z.array(blockedDateSchema).optional(),
});

export type CreateAdvocateProfileInput = z.infer<
  typeof createAdvocateProfileSchema
>;

export type UpdateAdvocateProfileInput = z.infer<
  typeof updateAdvocateProfileSchema
>;

export type UpdateAvailabilityInput = z.infer<
  typeof updateAvailabilitySchema
>;
