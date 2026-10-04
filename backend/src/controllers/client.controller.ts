import type { Request, Response } from "express";
import { AppError } from "../utils/AppError";
import {
  clientIdSchema,
  createClientSchema,
  updateClientSchema,
} from "../validators/client.validators";
import {
  createClient,
  deleteClient,
  getClient,
  getMyClients,
  updateClient,
} from "../services/client.service";

interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    role: "client" | "advocate" | "admin";
  };
}

const getUserId = (req: AuthenticatedRequest): string => {
  if (!req.user) {
    throw new AppError(401, "Authentication required");
  }

  return req.user.userId;
};

const getClientId = (req: AuthenticatedRequest): string => {
  const result = clientIdSchema.safeParse(req.params);

  if (!result.success) {
    throw new AppError(400, "Invalid client ID");
  }

  return result.data.clientId;
};

export const create = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  const result = createClientSchema.safeParse(req.body);

  if (!result.success) {
    throw new AppError(400, "Validation failed", result.error.issues);
  }

  const client = await createClient(
    getUserId(req),
    result.data,
  );

  res.status(201).json({
    success: true,
    message: "Client created successfully",
    data: { client },
  });
};

export const mine = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  const clients = await getMyClients(getUserId(req));

  res.status(200).json({
    success: true,
    data: { clients },
  });
};

export const getOne = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  const client = await getClient(
    getUserId(req),
    getClientId(req),
  );

  res.status(200).json({
    success: true,
    data: { client },
  });
};

export const update = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  const result = updateClientSchema.safeParse(req.body);

  if (!result.success) {
    throw new AppError(400, "Validation failed", result.error.issues);
  }

  const client = await updateClient(
    getUserId(req),
    getClientId(req),
    result.data,
  );

  res.status(200).json({
    success: true,
    message: "Client updated successfully",
    data: { client },
  });
};

export const remove = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  await deleteClient(
    getUserId(req),
    getClientId(req),
  );

  res.status(200).json({
    success: true,
    message: "Client deleted successfully",
  });
};
