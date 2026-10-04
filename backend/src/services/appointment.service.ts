import { AdvocateProfile } from "../models/AdvocateProfile";
import { Appointment } from "../models/Appointment";
import { AppError } from "../utils/AppError";
import type { CreateAppointmentInput } from "../validators/appointment.validators";

export const createAppointment = async (
  clientId: string,
  input: CreateAppointmentInput,
) => {
  if (input.endAt <= input.startAt) {
    throw new AppError(
      400,
      "Appointment end time must be after start time",
    );
  }

  if (input.startAt <= new Date()) {
    throw new AppError(
      400,
      "Appointment must be scheduled for a future time",
    );
  }

  const advocate = await AdvocateProfile.findOne({
    _id: input.advocateId,
    "verification.status": "verified",
    isListed: true,
  }).lean();

  if (!advocate) {
    throw new AppError(404, "Advocate not found");
  }

  const durationMinutes =
    (input.endAt.getTime() - input.startAt.getTime()) /
    (60 * 1000);

  if (
    durationMinutes !==
    advocate.availability.slotDurationMins
  ) {
    throw new AppError(
      400,
      `Appointment duration must be ${advocate.availability.slotDurationMins} minutes`,
    );
  }

  const overlappingAppointment =
    await Appointment.findOne({
      advocate: input.advocateId,
      status: {
        $in: ["pending", "confirmed"],
      },
      startAt: {
        $lt: input.endAt,
      },
      endAt: {
        $gt: input.startAt,
      },
    });

  if (overlappingAppointment) {
    throw new AppError(
      409,
      "This appointment slot is already booked",
    );
  }

  const appointment = await Appointment.create({
    advocate: input.advocateId,
    client: clientId,
    startAt: input.startAt,
    endAt: input.endAt,
    issueDescription: input.issueDescription,
    status: "pending",
  });

  return appointment;
};

export const getClientAppointments = async (
  clientId: string,
) => {
  return Appointment.find({
    client: clientId,
  })
    .sort({ startAt: 1 })
    .populate({
      path: "advocate",
      select:
        "slug headline city qualification practiceAreas consultationFee consultationModes ratingAverage ratingCount",
    })
    .lean();
};

export const getAdvocateAppointments = async (
  userId: string,
) => {
  const advocate = await AdvocateProfile.findOne({
    user: userId,
  }).select("_id");

  if (!advocate) {
    throw new AppError(404, "Advocate profile not found");
  }

  return Appointment.find({
    advocate: advocate._id,
  })
    .sort({ startAt: 1 })
    .populate({
      path: "client",
      select: "name email phone",
    })
    .lean();
};

const getAdvocateForUser = async (
  userId: string,
  appointmentId: string,
) => {
  const appointment = await Appointment.findById(
    appointmentId,
  );

  if (!appointment) {
    throw new AppError(404, "Appointment not found");
  }

  const advocate = await AdvocateProfile.findOne({
    _id: appointment.advocate,
    user: userId,
  });

  if (!advocate) {
    throw new AppError(404, "Appointment not found");
  }

  return appointment;
};

export const confirmAppointment = async (
  userId: string,
  appointmentId: string,
) => {
  const appointment = await getAdvocateForUser(
    userId,
    appointmentId,
  );

  if (appointment.status !== "pending") {
    throw new AppError(
      400,
      "Only pending appointments can be confirmed",
    );
  }

  const conflict = await Appointment.findOne({
    _id: { $ne: appointment._id },
    advocate: appointment.advocate,
    status: "confirmed",
    startAt: { $lt: appointment.endAt },
    endAt: { $gt: appointment.startAt },
  });

  if (conflict) {
    throw new AppError(
      409,
      "This slot has already been confirmed for another appointment",
    );
  }

  appointment.status = "confirmed";
  await appointment.save();

  return appointment;
};

export const rejectAppointment = async (
  userId: string,
  appointmentId: string,
  rejectionReason?: string,
) => {
  const appointment = await getAdvocateForUser(
    userId,
    appointmentId,
  );

  if (appointment.status !== "pending") {
    throw new AppError(
      400,
      "Only pending appointments can be rejected",
    );
  }

  appointment.status = "rejected";
  appointment.rejectionReason =
    rejectionReason?.trim() || undefined;

  await appointment.save();

  return appointment;
};

export const completeAppointment = async (
  userId: string,
  appointmentId: string,
) => {
  const appointment = await getAdvocateForUser(
    userId,
    appointmentId,
  );

  if (appointment.status !== "confirmed") {
    throw new AppError(
      400,
      "Only confirmed appointments can be completed",
    );
  }

  appointment.status = "completed";
  await appointment.save();

  return appointment;
};

export const cancelAppointment = async (
  userId: string,
  appointmentId: string,
) => {
  const appointment = await Appointment.findById(
    appointmentId,
  );

  if (!appointment) {
    throw new AppError(404, "Appointment not found");
  }

  const isClient =
    appointment.client.toString() === userId;

  let isAdvocate = false;

  if (!isClient) {
    const advocate = await AdvocateProfile.findOne({
      _id: appointment.advocate,
      user: userId,
    }).select("_id");

    isAdvocate = Boolean(advocate);
  }

  if (!isClient && !isAdvocate) {
    throw new AppError(404, "Appointment not found");
  }

  if (
    appointment.status === "cancelled" ||
    appointment.status === "completed" ||
    appointment.status === "rejected"
  ) {
    throw new AppError(
      400,
      "This appointment cannot be cancelled",
    );
  }

  appointment.status = "cancelled";
  appointment.cancelledBy = appointment.client;

  if (isAdvocate) {
    appointment.cancelledBy = appointment.advocate as never;
  }

  await appointment.save();

  return appointment;
};
