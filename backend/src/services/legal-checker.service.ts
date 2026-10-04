import { LegalCategory } from "../models/LegalCategory";
import { LegalProvision } from "../models/LegalProvision";
import { AppError } from "../utils/AppError";

const DISCLAIMER =
  "This tool provides general legal information only. It is not legal advice and does not determine whether a legal claim or charge applies. For advice about your specific situation, consult a qualified advocate.";

const normalizeText = (value: string): string =>
  value
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();

const getTerms = (query: string): string[] => {
  const normalized = normalizeText(query);

  return normalized
    .split(" ")
    .filter((word) => word.length >= 3);
};

export const checkLegalIssue = async (query: string) => {
  const terms = getTerms(query);

  if (terms.length === 0) {
    throw new AppError(400, "Please describe your legal issue");
  }

  const categories = await LegalCategory.find({
    isActive: true,
  }).lean();

  const categoryMatches = categories
    .map((category) => {
      const searchableText = normalizeText(
        [
          category.name,
          category.description,
          ...category.keywords,
          ...category.synonyms,
        ].join(" "),
      );

      const matchedTerms = terms.filter((term) =>
        searchableText.includes(term),
      );

      return {
        category,
        score: matchedTerms.length,
        matchedTerms,
      };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);

  const categoryIds = categoryMatches.map((item) => item.category._id);

  let provisions: Array<Record<string, unknown>> = [];

  if (categoryIds.length > 0) {
    const allProvisions = await LegalProvision.find({
      category: { $in: categoryIds },
      isActive: true,
    })
      .populate("category", "name slug")
      .lean();

    provisions = allProvisions
      .map((provision) => {
        const searchableText = normalizeText(
          [
            provision.lawName,
            provision.section,
            provision.title,
            provision.plainExplanation,
            ...provision.keywords,
          ].join(" "),
        );

        const matchedTerms = terms.filter((term) =>
          searchableText.includes(term),
        );

        return {
          ...provision,
          matchScore: matchedTerms.length,
          matchedTerms,
        };
      })
      .filter((provision) => provision.matchScore > 0)
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 10);
  }

  return {
    query,
    disclaimer: DISCLAIMER,
    matches: categoryMatches.map((item) => ({
      category: item.category,
      matchedTerms: item.matchedTerms,
      score: item.score,
    })),
    provisions,
  };
};

export const getLegalCategories = async () => {
  return LegalCategory.find({
    isActive: true,
  })
    .sort({ name: 1 })
    .lean();
};

export const getCategoryProvisions = async (slug: string) => {
  const category = await LegalCategory.findOne({
    slug: slug.toLowerCase(),
    isActive: true,
  }).lean();

  if (!category) {
    throw new AppError(404, "Legal category not found");
  }

  const provisions = await LegalProvision.find({
    category: category._id,
    isActive: true,
  })
    .sort({ lawName: 1, section: 1 })
    .lean();

  return {
    category,
    provisions,
  };
};
