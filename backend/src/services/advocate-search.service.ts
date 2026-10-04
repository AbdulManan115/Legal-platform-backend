import { AdvocateProfile } from "../models/AdvocateProfile";
import type { AdvocateSearchInput } from "../validators/advocate-search.validators";

export const searchAdvocates = async (
  input: AdvocateSearchInput,
) => {
  const {
    q,
    city,
    province,
    practiceArea,
    consultationMode,
    minExperience,
    maxExperience,
    minRating,
    sort,
    page,
    limit,
  } = input;

  const filter: Record<string, unknown> = {
    "verification.status": "verified",
    isListed: true,
  };

  if (city) {
    filter.city = {
      $regex: `^${escapeRegex(city)}$`,
      $options: "i",
    };
  }

  if (province) {
    filter.province = {
      $regex: `^${escapeRegex(province)}$`,
      $options: "i",
    };
  }

  if (practiceArea) {
    filter.practiceAreas = {
      $regex: escapeRegex(practiceArea),
      $options: "i",
    };
  }

  if (consultationMode) {
    filter.consultationModes = consultationMode;
  }

  if (minExperience !== undefined || maxExperience !== undefined) {
    const experienceFilter: Record<string, number> = {};

    if (minExperience !== undefined) {
      experienceFilter.$gte = minExperience;
    }

    if (maxExperience !== undefined) {
      experienceFilter.$lte = maxExperience;
    }

    filter.experienceYears = experienceFilter;
  }

  if (minRating !== undefined) {
    filter.ratingAverage = {
      $gte: minRating,
    };
  }

  if (q) {
    const searchRegex = {
      $regex: escapeRegex(q),
      $options: "i",
    };

    filter.$or = [
      { nameSearch: searchRegex },
      { headline: searchRegex },
      { bio: searchRegex },
      { city: searchRegex },
      { practiceAreas: searchRegex },
    ];
  }

  const sortMap: Record<string, Record<string, 1 | -1>> = {
    rating: {
      ratingAverage: -1,
      ratingCount: -1,
    },
    experience: {
      experienceYears: -1,
    },
    fee_low: {
      consultationFee: 1,
    },
    fee_high: {
      consultationFee: -1,
    },
    newest: {
      createdAt: -1,
    },
  };

  const skip = (page - 1) * limit;

  const [profiles, total] = await Promise.all([
    AdvocateProfile.find(filter)
      .sort(sortMap[sort])
      .skip(skip)
      .limit(limit)
      .select(
        "slug headline bio city province qualification experienceYears practiceAreas consultationFee consultationModes ratingAverage ratingCount",
      )
      .lean(),
    AdvocateProfile.countDocuments(filter),
  ]);

  return {
    advocates: profiles,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasNextPage: page * limit < total,
      hasPreviousPage: page > 1,
    },
  };
};

const escapeRegex = (value: string): string =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
