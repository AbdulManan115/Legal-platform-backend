import { AdvocateClient } from "../models/AdvocateClient";
import { AdvocateProfile } from "../models/AdvocateProfile";
import { Case } from "../models/Case";
import { AppError } from "../utils/AppError";
import type {
  CreateCaseInput,
  UpdateCaseInput,
} from "../validators/case.validators";

const getAdvocateProfile = async (userId: string) => {
  const advocate = await AdvocateProfile.findOne({
    user: userId,
  }).select("_id");

  if (!advocate) {
    throw new AppError(404, "Advocate profile not found");
  }

  return advocate;
};

const generateCaseCode = async (
  advocateId: string,
): Promise<string> => {
  const latestCase = await Case.findOne({
    advocate: advocateId,
  })
    .sort({ createdAt: -1 })
    .select("caseCode")
    .lean();

  let nextNumber = 1;

  if (latestCase?.caseCode) {
    const match = latestCase.caseCode.match(/(\d+)$/);

    if (match) {
      nextNumber = Number(match[1]) + 1;
    }
  }

  return `C-${String(nextNumber).padStart(4, "0")}`;
};

const getOwnedClient = async (
  advocateId: string,
  clientId: string,
) => {
  const client = await AdvocateClient.findOne({
    _id: clientId,
    advocate: advocateId,
  }).select("_id name phone email");

  if (!client) {
    throw new AppError(
      404,
      "Client not found or does not belong to you",
    );
  }

  return client;
};

export const createCase = async (
  userId: string,
  input: CreateCaseInput,
) => {
  const advocate = await getAdvocateProfile(userId);

  await getOwnedClient(
    advocate._id.toString(),
    input.clientId,
  );

  const caseCode = await generateCaseCode(
    advocate._id.toString(),
  );

  const newCase = await Case.create({
    advocate: advocate._id,
    client: input.clientId,
    caseCode,
    caseNumber: input.caseNumber,
    title: input.title,
    caseType: input.caseType,
    court: input.court,
    judge: input.judge,
    oppositeParty: input.oppositeParty,
    description: input.description,
    filingDate: input.filingDate,
    status: input.status,
    importantNotes: input.importantNotes,
  });

  return newCase.populate({
    path: "client",
    select: "name phone email",
  });
};

export const getMyCases = async (
  userId: string,
) => {
  const advocate = await getAdvocateProfile(userId);

  return Case.find({
    advocate: advocate._id,
  })
    .sort({ createdAt: -1 })
    .populate({
      path: "client",
      select: "name phone email",
    })
    .lean();
};

export const getCase = async (
  userId: string,
  caseId: string,
) => {
  const advocate = await getAdvocateProfile(userId);

  const legalCase = await Case.findOne({
    _id: caseId,
    advocate: advocate._id,
  })
    .populate({
      path: "client",
      select: "name phone email address",
    })
    .lean();

  if (!legalCase) {
    throw new AppError(404, "Case not found");
  }

  return legalCase;
};

export const updateCase = async (
  userId: string,
  caseId: string,
  input: UpdateCaseInput,
) => {
  const advocate = await getAdvocateProfile(userId);

  const legalCase = await Case.findOne({
    _id: caseId,
    advocate: advocate._id,
  });

  if (!legalCase) {
    throw new AppError(404, "Case not found");
  }

  if (input.caseNumber !== undefined) {
    legalCase.caseNumber = input.caseNumber;
  }

  if (input.title !== undefined) {
    legalCase.title = input.title;
  }

  if (input.caseType !== undefined) {
    legalCase.caseType = input.caseType;
  }

  if (input.court !== undefined) {
    legalCase.court = input.court;
  }

  if (input.judge !== undefined) {
    legalCase.judge = input.judge;
  }

  if (input.oppositeParty !== undefined) {
    legalCase.oppositeParty = input.oppositeParty;
  }

  if (input.description !== undefined) {
    legalCase.description = input.description;
  }

  if (input.filingDate !== undefined) {
    legalCase.filingDate = input.filingDate;
  }

  if (input.status !== undefined) {
    legalCase.status = input.status;
  }

  if (input.importantNotes !== undefined) {
    legalCase.importantNotes = input.importantNotes;
  }

  await legalCase.save();

  return legalCase.populate({
    path: "client",
    select: "name phone email",
  });
};

export const deleteCase = async (
  userId: string,
  caseId: string,
) => {
  const advocate = await getAdvocateProfile(userId);

  const legalCase = await Case.findOneAndDelete({
    _id: caseId,
    advocate: advocate._id,
  });

  if (!legalCase) {
    throw new AppError(404, "Case not found");
  }

  return legalCase;
};
