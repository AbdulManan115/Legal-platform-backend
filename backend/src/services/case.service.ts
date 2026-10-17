import { AdvocateClient } from "../models/AdvocateClient";
import { AdvocateProfile } from "../models/AdvocateProfile";
import { Case } from "../models/Case";
import { Hearing } from "../models/Hearing";
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

export const getCasesForClient = async (
  userId: string,
  clientId: string,
) => {
  const advocate = await getAdvocateProfile(userId);

  const client = await AdvocateClient.findOne({
    _id: clientId,
    advocate: advocate._id,
  }).select("_id");

  if (!client) {
    throw new AppError(404, "Client not found");
  }

  return Case.find({
    advocate: advocate._id,
    client: client._id,
  })
    .sort({ createdAt: -1 })
    .populate({
      path: "client",
      select: "name phone email address",
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


export const getMyClientCaseDetails = async (
  userId: string,
  caseId: string,
) => {
  const client = await AdvocateClient.findOne({
    linkedUser: userId,
  }).select("_id name");

  if (!client) {
    throw new AppError(404, "Client profile not linked");
  }

  const legalCase = await Case.findOne({
    _id: caseId,
    client: client._id,
  })
    .select(
      "_id caseCode caseNumber title caseType court judge oppositeParty description filingDate status",
    )
    .populate({
      path: "client",
      select: "name",
    })
    .lean();

  if (!legalCase) {
    throw new AppError(404, "Case not found");
  }

  const nextHearing = await Hearing.findOne({
    case: legalCase._id,
    status: "scheduled",
    dateTime: { $gte: new Date() },
  })
    .sort({ dateTime: 1 })
    .select("_id court judge dateTime status")
    .lean();

  return {
    ...legalCase,
    nextHearing: nextHearing ?? null,
  };
};

export const getMyClientCases = async (userId: string) => {
  const cases = await Case.find()
    .populate({
      path: "client",
      match: { linkedUser: userId },
      select: "name",
    })
    .sort({ createdAt: -1 })
    .lean();

  return cases
    .filter((legalCase) => legalCase.client)
    .map((legalCase) => ({
      _id: legalCase._id,
      caseCode: legalCase.caseCode,
      caseNumber: legalCase.caseNumber,
      title: legalCase.title,
      caseType: legalCase.caseType,
      court: legalCase.court,
      judge: legalCase.judge,
      oppositeParty: legalCase.oppositeParty,
      filingDate: legalCase.filingDate,
      status: legalCase.status,
      client: legalCase.client,
    }));
};
