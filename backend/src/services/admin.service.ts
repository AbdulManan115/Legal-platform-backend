import { updateAdvocateRating } from "./review.service.js";
import { User } from "../models/User";
import { AdvocateProfile } from "../models/AdvocateProfile";
import { Appointment } from "../models/Appointment";
import { Case } from "../models/Case";
import { Review } from "../models/Review";
import { AppError } from "../utils/AppError";

export const getDashboardStats = async () => {
  const [
    totalUsers,
    totalClients,
    totalAdvocates,
    activeUsers,
    suspendedUsers,
    pendingAdvocates,
    verifiedAdvocates,
    totalAppointments,
    totalCases,
    totalReviews,
  ] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ role: "client" }),
    User.countDocuments({ role: "advocate" }),
    User.countDocuments({ status: "active" }),
    User.countDocuments({ status: "suspended" }),
    AdvocateProfile.countDocuments({ "verification.status": "pending" }),
    AdvocateProfile.countDocuments({ "verification.status": "verified" }),
    Appointment.countDocuments(),
    Case.countDocuments(),
    Review.countDocuments(),
  ]);

  return {
    users: {
      total: totalUsers,
      clients: totalClients,
      advocates: totalAdvocates,
      active: activeUsers,
      suspended: suspendedUsers,
    },
    advocates: {
      pendingVerification: pendingAdvocates,
      verified: verifiedAdvocates,
    },
    appointments: totalAppointments,
    cases: totalCases,
    reviews: totalReviews,
  };
};

export const listUsers = async (
  page = 1,
  limit = 20,
  role?: string,
  status?: string,
  search?: string,
) => {
  const filter: Record<string, unknown> = {};

  if (role) filter.role = role;
  if (status) filter.status = status;

  if (search?.trim()) {
    const regex = new RegExp(search.trim(), "i");

    filter.$or = [
      { name: regex },
      { email: regex },
      { phone: regex },
    ];
  }

  const skip = (page - 1) * limit;

  const [users, total] = await Promise.all([
    User.find(filter)
      .select("-passwordHash -refreshTokens")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),

    User.countDocuments(filter),
  ]);

  return {
    users,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const updateUserStatus = async (
  userId: string,
  status: "active" | "suspended",
  actingAdminId?: string,
) => {
  const targetUser = await User.findById(userId);

  if (!targetUser) {
    throw new AppError(404, "User not found");
  }

  if (targetUser.role === "admin" && status === "suspended") {
    throw new AppError(403, "Admin accounts cannot be suspended");
  }

  if (actingAdminId && targetUser._id.toString() === actingAdminId) {
    throw new AppError(403, "You cannot change your own account status");
  }

  const user = await User.findByIdAndUpdate(
    userId,
    { $set: { status } },
    { returnDocument: "after" },
  )
    .select("-passwordHash -refreshTokens")
    .lean();

  if (!user) {
    throw new AppError(404, "User not found");
  }

  return user;
};

export const updateUserRole = async (
  userId: string,
  role: "client" | "advocate" | "admin",
  actingAdminId?: string,
) => {
  const targetUser = await User.findById(userId);

  if (!targetUser) {
    throw new AppError(404, "User not found");
  }

  if (targetUser.role === "admin" || role === "admin") {
    throw new AppError(403, "Admin account roles cannot be changed");
  }

  if (actingAdminId && targetUser._id.toString() === actingAdminId) {
    throw new AppError(403, "You cannot change your own account role");
  }

  const user = await User.findByIdAndUpdate(
    userId,
    { $set: { role } },
    { returnDocument: "after" },
  )
    .select("-passwordHash -refreshTokens")
    .lean();

  if (!user) {
    throw new AppError(404, "User not found");
  }

  return user;
};

export const listPendingAdvocates = async () => {
  return AdvocateProfile.find({
    "verification.status": "pending",
  })
    .populate("user", "name email phone")
    .sort({ createdAt: 1 })
    .lean();
};

export const updateAdvocateVerification = async (
  advocateId: string,
  status: "verified" | "rejected",
  rejectionReason?: string,
  adminUserId?: string,
) => {
  const profile = await AdvocateProfile.findById(advocateId);

  if (!profile) {
    throw new AppError(404, "Advocate profile not found");
  }

  profile.verification.status = status;
  profile.verification.reviewedAt = new Date();

  if (adminUserId) {
    profile.verification.reviewedBy = adminUserId as never;
  }

  if (status === "rejected") {
    profile.verification.rejectionReason =
      rejectionReason || "Verification rejected";
    profile.isListed = false;
  } else {
    profile.verification.rejectionReason = undefined;
    profile.isListed = true;
  }

  await profile.save();

  return profile.toObject();
};

export const listReviewsForModeration = async (
  page = 1,
  limit = 20,
  status?: "visible" | "hidden",
) => {
  const filter: Record<string, unknown> = {};

  if (status) {
    filter.status = status;
  }

  const skip = (page - 1) * limit;

  const [reviews, total] = await Promise.all([
    Review.find(filter)
      .populate("advocate", "slug ratingAverage ratingCount")
      .populate("client", "name email")
      .populate("appointment", "startAt endAt status")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),

    Review.countDocuments(filter),
  ]);

  return {
    reviews,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const updateReviewModeration = async (
  reviewId: string,
  status: "visible" | "hidden",
) => {
  const review = await Review.findByIdAndUpdate(
    reviewId,
    { $set: { status } },
    { returnDocument: "after" },
  ).lean();

  if (!review) {
    throw new AppError(404, "Review not found");
  }

  await updateAdvocateRating(review.advocate);

  return review;
};

export const listLegalCategoriesAdmin = async () => {
  return (await import("../models/LegalCategory.js")).LegalCategory.find()
    .sort({ name: 1 })
    .lean();
};

export const createLegalCategory = async (data: {
  name: string;
  slug: string;
  description: string;
  icon?: string;
  keywords: string[];
  synonyms: string[];
  isActive: boolean;
}) => {
  const { LegalCategory } = await import("../models/LegalCategory.js");

  const exists = await LegalCategory.findOne({
    $or: [{ slug: data.slug }, { name: data.name }],
  });

  if (exists) {
    throw new AppError(409, "Legal category already exists");
  }

  return LegalCategory.create(data);
};

export const updateLegalCategory = async (
  categoryId: string,
  data: Record<string, unknown>,
) => {
  const { LegalCategory } = await import("../models/LegalCategory.js");

  const category = await LegalCategory.findByIdAndUpdate(
    categoryId,
    { $set: data },
    { returnDocument: "after", runValidators: true },
  ).lean();

  if (!category) {
    throw new AppError(404, "Legal category not found");
  }

  return category;
};

export const deleteLegalCategory = async (categoryId: string) => {
  const { LegalCategory } = await import("../models/LegalCategory.js");
  const { LegalProvision } = await import("../models/LegalProvision.js");

  const provisionCount = await LegalProvision.countDocuments({
    category: categoryId,
  });

  if (provisionCount > 0) {
    throw new AppError(
      409,
      "Cannot delete category because legal provisions exist under it. Deactivate it instead.",
    );
  }

  const category = await LegalCategory.findByIdAndDelete(categoryId);

  if (!category) {
    throw new AppError(404, "Legal category not found");
  }

  return category;
};

export const listLegalProvisionsAdmin = async () => {
  const { LegalProvision } = await import("../models/LegalProvision.js");

  return LegalProvision.find()
    .populate("category", "name slug")
    .sort({ lawName: 1, section: 1 })
    .lean();
};

export const createLegalProvision = async (data: {
  category: string;
  lawName: string;
  section: string;
  title: string;
  plainExplanation: string;
  keywords: string[];
  isActive: boolean;
}) => {
  const { LegalProvision } = await import("../models/LegalProvision.js");
  const { LegalCategory } = await import("../models/LegalCategory.js");

  const category = await LegalCategory.findById(data.category);

  if (!category) {
    throw new AppError(404, "Legal category not found");
  }

  return LegalProvision.create(data);
};

export const updateLegalProvision = async (
  provisionId: string,
  data: Record<string, unknown>,
) => {
  const { LegalProvision } = await import("../models/LegalProvision.js");

  const provision = await LegalProvision.findByIdAndUpdate(
    provisionId,
    { $set: data },
    { returnDocument: "after", runValidators: true },
  ).lean();

  if (!provision) {
    throw new AppError(404, "Legal provision not found");
  }

  return provision;
};

export const deleteLegalProvision = async (provisionId: string) => {
  const { LegalProvision } = await import("../models/LegalProvision.js");

  const provision = await LegalProvision.findByIdAndDelete(provisionId);

  if (!provision) {
    throw new AppError(404, "Legal provision not found");
  }

  return provision;
};
