import type { Request, Response } from "express";
import { AppError } from "../utils/AppError";
import {
  appointmentIdSchema,
  createAppointmentSchema,
  rejectAppointmentSchema,
} from "../validators/appointment.validators";
import {
  cancelAppointment,
  completeAppointment,
  confirmAppointment,
  createAppointment,
  getAdvocateAppointments,
  getClientAppointments,
  rejectAppointment,
} from "../services/appointment.service";

interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    role: "client" | "advocate" | "admin";
  };
}

const getUserId = (
  req: AuthenticatedRequest,
): string => {
  if (!req.user) {
    throw new AppError(401, "Authentication required");
  }

  return req.user.userId;
};

const getAppointmentId = (
  req: AuthenticatedRequest,
): string => {
  const result = appointmentIdSchema.safeParse(
    req.params,
  );

  if (!result.success) {
    throw new AppError(400, "Invalid appointment ID");
  }

  return result.data.appointmentId;
};

export const create = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  const result = createAppointmentSchema.safeParse(
    req.body,
  );

  if (!result.success) {
    throw new AppError(
      400,
      "Validation failed",
      result.error.issues,
    );
  }

  const appointment = await createAppointment(
    getUserId(req),
    result.data,
  );

  res.status(201).json({
    success: true,
    message: "Appointment request created successfully",
    data: { appointment },
  });
};

export const clientMine = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  const appointments = await getClientAppointments(
    getUserId(req),
  );

  res.status(200).json({
    success: true,
    data: { appointments },
  });
};

export const advocateMine = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  const appointments =
    await getAdvocateAppointments(
      getUserId(req),
    );

  res.status(200).json({
    success: true,
    data: { appointments },
  });
};

export const confirm = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  const appointment =
    await confirmAppointment(
      getUserId(req),
      getAppointmentId(req),
    );

  res.status(200).json({
    success: true,
    message: "Appointment confirmed successfully",
    data: { appointment },
  });
};

export const reject = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  const result =
    rejectAppointmentSchema.safeParse(
      req.body,
    );

  if (!result.success) {
    throw new AppError(
      400,
      "Validation failed",
      result.error.issues,
    );
  }

  const appointment =
    await rejectAppointment(
      getUserId(req),
      getAppointmentId(req),
      result.data.rejectionReason,
    );

  res.status(200).json({
    success: true,
    message: "Appointment rejected successfully",
    data: { appointment },
  });
};

export const complete = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  const appointment =
    await completeAppointment(
      getUserId(req),
      getAppointmentId(req),
    );

  res.status(200).json({
    success: true,
    message: "Appointment completed successfully",
    data: { appointment },
  });
};

export const cancel = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  const appointment =
    await cancelAppointment(
      getUserId(req),
      getAppointmentId(req),
    );

  res.status(200).json({
    success: true,
    message: "Appointment cancelled successfully",
    data: { appointment },
  });
};
