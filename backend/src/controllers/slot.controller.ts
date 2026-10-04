import type { Request, Response } from "express";
import { AppError } from "../utils/AppError";
import { getAvailableSlots } from "../services/slot.service";

export const getSlots = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const advocateId = req.params.advocateId;

  if (!advocateId) {
    throw new AppError(
      400,
      "Advocate ID is required",
    );
  }

  const daysValue = Number(req.query.days ?? 7);

  if (
    !Number.isInteger(daysValue) ||
    daysValue < 1 ||
    daysValue > 30
  ) {
    throw new AppError(
      400,
      "days must be an integer between 1 and 30",
    );
  }

  const data = await getAvailableSlots(
    advocateId,
    daysValue,
  );

  res.status(200).json({
    success: true,
    data,
  });
};
