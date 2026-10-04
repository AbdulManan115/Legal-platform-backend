import { z } from "zod";

export const createClientSchema = z.object({
  name: z.string().trim().min(2).max(100),
  phone: z.string().trim().min(3).max(30),
  email: z.string().trim().email().max(254).optional(),
  address: z.string().trim().max(500).optional(),
  notes: z.string().trim().max(2000).optional(),
});

export const updateClientSchema = z.object({
  name: z.string().trim().min(2).max(100).optional(),
  phone: z.string().trim().min(3).max(30).optional(),
  email: z.string().trim().email().max(254).optional(),
  address: z.string().trim().max(500).optional(),
  notes: z.string().trim().max(2000).optional(),
});

export const clientIdSchema = z.object({
  clientId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid client ID"),
});

export type CreateClientInput = z.infer<typeof createClientSchema>;
export type UpdateClientInput = z.infer<typeof updateClientSchema>;
