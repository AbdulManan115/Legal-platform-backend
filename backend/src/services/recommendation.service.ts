import { AdvocateProfile } from "../models/AdvocateProfile";

interface RecommendationInput {
  practiceArea?: string;
  city?: string;
}

interface RecommendationResult {
  advocate: {
    id: string;
    slug: string;
    headline?: string;
    city: string;
    province: string;
    qualification: string;
    experienceYears: number;
    practiceAreas: string[];
    consultationFee?: number;
    consultationModes: string[];
    ratingAverage: number;
    ratingCount: number;
  };
  score: number;
  reasons: string[];
}

const normalize = (value: string): string =>
  value.trim().toLowerCase();

const getPakistanDateParts = (date: Date): {
  dateKey: string;
  day: number;
} => {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Karachi",
    weekday: "short",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  const parts = formatter.formatToParts(date);

  const year = parts.find((part) => part.type === "year")?.value ?? "";
  const month = parts.find((part) => part.type === "month")?.value ?? "";
  const dayOfMonth =
    parts.find((part) => part.type === "day")?.value ?? "";
  const weekday =
    parts.find((part) => part.type === "weekday")?.value ?? "";

  const weekdayMap: Record<string, number> = {
    Sun: 0,
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6,
  };

  return {
    dateKey: `${year}-${month}-${dayOfMonth}`,
    day: weekdayMap[weekday],
  };
};

const getDateKey = (date: Date): string => {
  return getPakistanDateParts(date).dateKey;
};

const calculateRatingScore = (
  ratingAverage: number,
  ratingCount: number,
): number => {
  if (ratingCount === 0) {
    return 0;
  }

  const confidence = Math.min(ratingCount / 20, 1);

  return (ratingAverage / 5) * confidence;
};

const calculateNext7DaysAvailabilityScore = (profile: {
  availability: {
    weekly: Array<{
      day: number;
      enabled: boolean;
    }>;
    blockedDates: Array<{
      date: Date;
    }>;
  };
}): { score: number; availableDays: number } => {
  const weeklyByDay = new Map(
    profile.availability.weekly.map((item) => [
      item.day,
      item.enabled,
    ]),
  );

  const blockedDates = new Set(
    profile.availability.blockedDates.map((item) =>
      getDateKey(new Date(item.date)),
    ),
  );

  let availableDays = 0;

  for (let offset = 0; offset < 7; offset += 1) {
    const date = new Date();
    date.setDate(date.getDate() + offset);

    const { dateKey, day } = getPakistanDateParts(date);

    if (weeklyByDay.get(day) === true && !blockedDates.has(dateKey)) {
      availableDays += 1;
    }
  }

  return {
    score: Math.min(availableDays / 5, 1),
    availableDays,
  };
};

export const getRecommendedAdvocates = async (
  input: RecommendationInput,
): Promise<RecommendationResult[]> => {
  const profiles = await AdvocateProfile.find({
    "verification.status": "verified",
    isListed: true,
  })
    .select(
      "slug headline city province qualification experienceYears practiceAreas consultationFee consultationModes ratingAverage ratingCount availability",
    )
    .lean();

  const requestedPracticeArea = input.practiceArea
    ? normalize(input.practiceArea)
    : undefined;

  const requestedCity = input.city
    ? normalize(input.city)
    : undefined;

  const recommendations = profiles.map((profile) => {
    const reasons: string[] = [];

    const practiceAreaMatch =
      requestedPracticeArea !== undefined &&
      profile.practiceAreas.some(
        (area) => normalize(area) === requestedPracticeArea,
      );

    const cityMatch =
      requestedCity !== undefined &&
      normalize(profile.city) === requestedCity;

    const practiceScore = practiceAreaMatch ? 1 : 0;
    const cityScore = cityMatch ? 1 : 0;

    const ratingScore = calculateRatingScore(
      profile.ratingAverage,
      profile.ratingCount,
    );

    const experienceScore = Math.min(
      profile.experienceYears / 15,
      1,
    );

    const availability = calculateNext7DaysAvailabilityScore(
      profile,
    );

    const score =
      practiceScore * 40 +
      cityScore * 20 +
      ratingScore * 20 +
      experienceScore * 10 +
      availability.score * 10;

    if (practiceAreaMatch) {
      reasons.push("Practice area matches your legal issue");
    }

    if (cityMatch) {
      reasons.push("Practices in your city");
    }

    if (profile.ratingCount > 0) {
      reasons.push(
        `${profile.ratingAverage.toFixed(1)} rating from ${profile.ratingCount} review${
          profile.ratingCount === 1 ? "" : "s"
        }`,
      );
    }

    if (profile.experienceYears > 0) {
      reasons.push(
        `${profile.experienceYears} years of legal experience`,
      );
    }

    if (availability.availableDays > 0) {
      reasons.push(
        `Available on ${availability.availableDays} day${
          availability.availableDays === 1 ? "" : "s"
        } in the next 7 days`,
      );
    }

    return {
      advocate: {
        id: profile._id.toString(),
        slug: profile.slug,
        headline: profile.headline,
        city: profile.city,
        province: profile.province,
        qualification: profile.qualification,
        experienceYears: profile.experienceYears,
        practiceAreas: profile.practiceAreas,
        consultationFee: profile.consultationFee,
        consultationModes: profile.consultationModes,
        ratingAverage: profile.ratingAverage,
        ratingCount: profile.ratingCount,
      },
      score: Number(score.toFixed(2)),
      reasons,
    };
  });

  return recommendations
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);
};
