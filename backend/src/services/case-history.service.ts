import { AdvocateProfile } from "../models/AdvocateProfile";
import { Case } from "../models/Case";
import { CaseHistory } from "../models/CaseHistory";
import { AppError } from "../utils/AppError";
import type {
  CreateCaseHistoryInput,
  UpdateCaseHistoryInput,
} from "../validators/case-history.validators";

const getAdvocate = async (userId: string) => {
  const advocate = await AdvocateProfile.findOne({
    user: userId,
  }).select("_id");

  if (!advocate) {
    throw new AppError(404, "Advocate profile not found");
  }

  return advocate;
};

const getOwnedCase = async (
  advocateId: string,
  caseId: string,
) => {
  const legalCase = await Case.findOne({
    _id: caseId,
    advocate: advocateId,
  }).select("_id");

  if (!legalCase) {
    throw new AppError(404, "Case not found");
  }

  return legalCase;
};

export const addCaseHistory = async (
  userId: string,
  input: CreateCaseHistoryInput,
) => {
  const advocate = await getAdvocate(userId);

  await getOwnedCase(
    advocate._id.toString(),
    input.caseId,
  );

  return CaseHistory.create({
    case: input.caseId,
    advocate: advocate._id,
    type: input.type,
    message: input.message,
    createdBy: userId,
  });
};

export const getCaseHistory = async (
  userId: string,
  caseId: string,
) => {
  const advocate = await getAdvocate(userId);

  await getOwnedCase(
    advocate._id.toString(),
    caseId,
  );

  return CaseHistory.find({
    case: caseId,
    advocate: advocate._id,
  })
    .sort({ createdAt: -1 })
    .populate({
      path: "createdBy",
      select: "name role",
    })
    .lean();
};


export const updateCaseHistory = async (
  userId: string,
  historyId: string,
  input: UpdateCaseHistoryInput,
) => {
  const advocate = await getAdvocate(userId);

  const history = await CaseHistory.findOne({
    _id: historyId,
    advocate: advocate._id,
  });

  if (!history) {
    throw new AppError(404, "History entry not found");
  }

  history.type = input.type;
  history.message = input.message;

  await history.save();

  return history.populate({
    path: "createdBy",
    select: "name role",
  });
};

export const deleteCaseHistory = async (
  userId: string,
  historyId: string,
) => {
  const advocate = await getAdvocate(userId);

  const history = await CaseHistory.findOne({
    _id: historyId,
    advocate: advocate._id,
  });

  if (!history) {
    throw new AppError(404, "History entry not found");
  }

  await history.deleteOne();

  return history;
};
