import mongoose from "mongoose";
import { Appointment } from "../models/Appointment";
import { Review } from "../models/Review";
import { AdvocateProfile } from "../models/AdvocateProfile";
import { AppError } from "../utils/AppError";
import type { CreateReviewInput } from "../validators/review.validators";

export const createReview = async (
  userId: string,
  input: CreateReviewInput,
) => {
  if (!mongoose.isValidObjectId(input.appointmentId)) {
    throw new AppError(400, "Invalid appointment ID");
  }

  const appointment = await Appointment.findById(input.appointmentId);

  if (!appointment) {
    throw new AppError(404, "Appointment not found");
  }

  if (appointment.client.toString() !== userId) {
    throw new AppError(404, "Appointment not found");
  }

  if (appointment.status !== "completed") {
    throw new AppError(
      400,
      "You can only review a completed appointment",
    );
  }

  const existing = await Review.findOne({
    appointment: appointment._id,
  });

  if (existing) {
    throw new AppError(409, "You have already reviewed this appointment");
  }

  const review = await Review.create({
    advocate: appointment.advocate,
    client: appointment.client,
    appointment: appointment._id,
    rating: input.rating,
    comment: input.comment || undefined,
    status: "visible",
  });

  await updateAdvocateRating(appointment.advocate);

  return Review.findById(review._id)
    .populate("client", "name")
    .populate("appointment", "startAt endAt issueDescription");
};

export const getMyReviewForAppointment = async (
  userId: string,
  appointmentId: string,
) => {
  if (!mongoose.isValidObjectId(appointmentId)) {
    throw new AppError(400, "Invalid appointment ID");
  }

  const review = await Review.findOne({
    appointment: appointmentId,
    client: userId,
  });

  return review;
};

export const getAdvocateReviews = async (
  advocateId: string,
  page: number,
  limit: number,
) => {
  if (!mongoose.isValidObjectId(advocateId)) {
    throw new AppError(400, "Invalid advocate ID");
  }

  const skip = (page - 1) * limit;

  const [reviews, total] = await Promise.all([
    Review.find({
      advocate: advocateId,
      status: "visible",
    })
      .populate("client", "name")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Review.countDocuments({
      advocate: advocateId,
      status: "visible",
    }),
  ]);

  return {
    reviews,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
};

export const updateAdvocateRating = async (
  advocateId: mongoose.Types.ObjectId,
) => {
  const result = await Review.aggregate([
    {
      $match: {
        advocate: advocateId,
        status: "visible",
      },
    },
    {
      $group: {
        _id: "$advocate",
        average: { $avg: "$rating" },
        count: { $sum: 1 },
      },
    },
  ]);

  const average = result[0]?.average ?? 0;
  const count = result[0]?.count ?? 0;

  await AdvocateProfile.findByIdAndUpdate(advocateId, {
    ratingAverage: Math.round(average * 10) / 10,
    ratingCount: count,
  });
};

export const getReviewByAppointment = async (
  userId: string,
  appointmentId: string,
) => {
  if (!mongoose.isValidObjectId(appointmentId)) {
    throw new AppError(400, "Invalid appointment ID");
  }

  const appointment = await Appointment.findById(appointmentId);

  if (!appointment || appointment.client.toString() !== userId) {
    throw new AppError(404, "Appointment not found");
  }

  return Review.findOne({
    appointment: appointmentId,
    client: userId,
  });
};
