import { z } from "zod";

export const createAppointmentSchema = z.object({
  advocateId: z.string().trim().min(1),
  startAt: z.coerce.date(),
  endAt: z.coerce.date(),
  issueDescription: z.string().trim().min(5).max(2000),
});

export const appointmentIdSchema = z.object({
  appointmentId: z.string().trim().min(1),
});

export const rejectAppointmentSchema = z.object({
  rejectionReason: z.string().trim().max(1000).optional(),
});

export type CreateAppointmentInput = z.infer<
  typeof createAppointmentSchema
>;
