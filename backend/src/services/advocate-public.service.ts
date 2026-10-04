import { AdvocateProfile } from "../models/AdvocateProfile";
import { AppError } from "../utils/AppError";

export const getPublicAdvocateProfile = async (slug: string) => {
  const profile = await AdvocateProfile.findOne({
    slug: slug.toLowerCase(),
    "verification.status": "verified",
    isListed: true,
  })
    .populate("user", "name avatarUrl")
    .lean();

  if (!profile) {
    throw new AppError(404, "Advocate profile not found");
  }

  return {
    id: profile._id.toString(),
    name:
      typeof profile.user === "object" && profile.user !== null
        ? (profile.user as { name?: string }).name
        : undefined,
    avatarUrl:
      typeof profile.user === "object" && profile.user !== null
        ? (profile.user as { avatarUrl?: string }).avatarUrl
        : undefined,

    slug: profile.slug,
    headline: profile.headline,
    bio: profile.bio,
    city: profile.city,
    province: profile.province,
    address: profile.address,
    publicPhone: profile.publicPhone,
    publicEmail: profile.publicEmail,
    qualification: profile.qualification,
    experienceYears: profile.experienceYears,
    practiceAreas: profile.practiceAreas,
    barCouncil: profile.barCouncil,
    licenseNumber: profile.licenseNumber,
    consultationFee: profile.consultationFee,
    consultationModes: profile.consultationModes,

    availability: {
      slotDurationMins: profile.availability.slotDurationMins,
      weekly: profile.availability.weekly,
      blockedDates: profile.availability.blockedDates,
    },

    ratingAverage: profile.ratingAverage,
    ratingCount: profile.ratingCount,
  };
};
