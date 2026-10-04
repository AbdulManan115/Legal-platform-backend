import { AdvocateProfile } from "../models/AdvocateProfile";
import { SavedAdvocate } from "../models/SavedAdvocate";
import { AppError } from "../utils/AppError";

export const saveAdvocate = async (
  clientId: string,
  advocateId: string,
) => {
  const advocate = await AdvocateProfile.findOne({
    _id: advocateId,
    "verification.status": "verified",
    isListed: true,
  });

  if (!advocate) {
    throw new AppError(404, "Advocate not found");
  }

  const existing = await SavedAdvocate.findOne({
    client: clientId,
    advocate: advocateId,
  });

  if (existing) {
    throw new AppError(409, "Advocate is already saved");
  }

  const saved = await SavedAdvocate.create({
    client: clientId,
    advocate: advocateId,
  });

  return saved;
};

export const unsaveAdvocate = async (
  clientId: string,
  advocateId: string,
) => {
  const deleted = await SavedAdvocate.findOneAndDelete({
    client: clientId,
    advocate: advocateId,
  });

  if (!deleted) {
    throw new AppError(404, "Saved advocate not found");
  }

  return true;
};

export const getSavedAdvocates = async (
  clientId: string,
) => {
  const saved = await SavedAdvocate.find({
    client: clientId,
  })
    .sort({ createdAt: -1 })
    .populate({
      path: "advocate",
      match: {
        "verification.status": "verified",
        isListed: true,
      },
      select:
        "slug headline city province qualification experienceYears practiceAreas consultationFee consultationModes ratingAverage ratingCount",
    })
    .lean();

  return saved
    .filter((item) => item.advocate !== null)
    .map((item) => ({
      id: item._id.toString(),
      savedAt: item.createdAt,
      advocate: item.advocate,
    }));
};
