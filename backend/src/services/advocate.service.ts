import { AdvocateProfile } from "../models/AdvocateProfile";
import { AppError } from "../utils/AppError";
import type {
  CreateAdvocateProfileInput,
  UpdateAdvocateProfileInput,
  UpdateAvailabilityInput,
} from "../validators/advocate.validators";

export const createAdvocateProfile = async (
  userId: string,
  input: CreateAdvocateProfileInput,
) => {
  const existingProfile = await AdvocateProfile.findOne({
    user: userId,
  });

  if (existingProfile) {
    throw new AppError(409, "Advocate profile already exists");
  }

  const existingSlug = await AdvocateProfile.findOne({
    slug: input.slug.toLowerCase(),
  });

  if (existingSlug) {
    throw new AppError(409, "This profile slug is already in use");
  }

  const profile = await AdvocateProfile.create({
    user: userId,
    ...input,
    slug: input.slug.toLowerCase(),
    verification: {
      status: "pending",
      documents: [],
    },
    ratingAverage: 0,
    ratingCount: 0,
    isListed: false,
    subscription: {
      plan: "free",
      status: "inactive",
    },
  });

  return profile;
};

export const getMyAdvocateProfile = async (
  userId: string,
) => {
  const profile = await AdvocateProfile.findOne({
    user: userId,
  });

  if (!profile) {
    throw new AppError(404, "Advocate profile not found");
  }

  return profile;
};

export const updateMyAdvocateProfile = async (
  userId: string,
  input: UpdateAdvocateProfileInput,
) => {
  const profile = await AdvocateProfile.findOne({
    user: userId,
  });

  if (!profile) {
    throw new AppError(404, "Advocate profile not found");
  }

  if (input.slug && input.slug.toLowerCase() !== profile.slug) {
    const existingSlug = await AdvocateProfile.findOne({
      slug: input.slug.toLowerCase(),
      _id: { $ne: profile._id },
    });

    if (existingSlug) {
      throw new AppError(409, "This profile slug is already in use");
    }

    profile.slug = input.slug.toLowerCase();
  }

  const updateData = { ...input };
  delete updateData.slug;

  Object.assign(profile, updateData);

  await profile.save();

  return profile;
};

export const updateMyAvailability = async (
  userId: string,
  input: UpdateAvailabilityInput,
) => {
  const profile = await AdvocateProfile.findOne({
    user: userId,
  });

  if (!profile) {
    throw new AppError(404, "Advocate profile not found");
  }

  if (input.slotDurationMins !== undefined) {
    profile.availability.slotDurationMins =
      input.slotDurationMins;
  }

  if (input.weekly !== undefined) {
    profile.availability.weekly = input.weekly;
  }

  if (input.blockedDates !== undefined) {
    profile.availability.blockedDates = input.blockedDates;
  }

  await profile.save();

  return profile.availability;
};
