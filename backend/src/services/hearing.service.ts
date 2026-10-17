import { AdvocateProfile } from "../models/AdvocateProfile";
import { Case } from "../models/Case";
import { Hearing } from "../models/Hearing";
import { AppError } from "../utils/AppError";
import { createNotification } from "./notification.service";
import type {
  CreateHearingInput,
  UpdateHearingInput,
} from "../validators/hearing.validators";

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
  })
    .select("_id caseCode client")
    .populate({
      path: "client",
      select: "linkedUser name",
    });

  if (!legalCase) {
    throw new AppError(404, "Case not found");
  }

  return legalCase;
};

export const createHearing = async (
  userId: string,
  input: CreateHearingInput,
) => {
  const advocate = await getAdvocate(userId);

  const legalCase = await getOwnedCase(
    advocate._id.toString(),
    input.caseId,
  );

  const hearing = await Hearing.create({
    case: input.caseId,
    advocate: advocate._id,
    court: input.court,
    judge: input.judge,
    dateTime: input.dateTime,
    notes: input.notes,
    status: input.status,
  });

  const client = legalCase.client as unknown as {
    linkedUser?: import("mongoose").Types.ObjectId;
  } | null;

  if (client?.linkedUser) {
    const hearingDate = new Date(input.dateTime).toLocaleString("en-PK", {
      dateStyle: "medium",
      timeStyle: "short",
      timeZone: "Asia/Karachi",
    });

    await createNotification({
      userId: client.linkedUser,
      type: "case_update",
      title: "New Hearing Scheduled",
      message: `A new hearing has been scheduled for your case ${legalCase.caseCode} on ${hearingDate}.`,
      link: `/client/cases/${input.caseId}`,
    });
  }

  return hearing;
};

export const getCaseHearings = async (
  userId: string,
  caseId: string,
) => {
  const advocate = await getAdvocate(userId);

  await getOwnedCase(
    advocate._id.toString(),
    caseId,
  );

  return Hearing.find({
    case: caseId,
    advocate: advocate._id,
  })
    .sort({ dateTime: 1 })
    .lean();
};

export const getUpcomingHearings = async (
  userId: string,
) => {
  const advocate = await getAdvocate(userId);

  return Hearing.find({
    advocate: advocate._id,
    status: "scheduled",
    dateTime: { $gte: new Date() },
  })
    .sort({ dateTime: 1 })
    .populate({
      path: "case",
      select: "caseCode caseNumber title caseType client",
      populate: {
        path: "client",
        select: "name phone email",
      },
    })
    .lean();
};

export const updateHearing = async (
  userId: string,
  hearingId: string,
  input: UpdateHearingInput,
) => {
  const advocate = await getAdvocate(userId);

  const hearing = await Hearing.findOne({
    _id: hearingId,
    advocate: advocate._id,
  });

  if (!hearing) {
    throw new AppError(404, "Hearing not found");
  }

  if (input.court !== undefined) hearing.court = input.court;
  if (input.judge !== undefined) hearing.judge = input.judge;
  if (input.dateTime !== undefined) hearing.dateTime = input.dateTime;
  if (input.notes !== undefined) hearing.notes = input.notes;
  if (input.status !== undefined) hearing.status = input.status;

  await hearing.save();

  const legalCase = await getOwnedCase(
    advocate._id.toString(),
    hearing.case.toString(),
  );

  const client = legalCase.client as unknown as {
    linkedUser?: import("mongoose").Types.ObjectId;
  } | null;

  if (client?.linkedUser) {
    const hearingDate = new Date(hearing.dateTime).toLocaleString("en-PK", {
      dateStyle: "medium",
      timeStyle: "short",
      timeZone: "Asia/Karachi",
    });

    await createNotification({
      userId: client.linkedUser,
      type: "case_update",
      title: "Hearing Updated",
      message: `The hearing for your case ${legalCase.caseCode} has been updated to ${hearingDate}.`,
      link: `/client/cases/${hearing.case.toString()}`,
    });
  }

  return hearing;
};

export const deleteHearing = async (
  userId: string,
  hearingId: string,
) => {
  const advocate = await getAdvocate(userId);

  const hearing = await Hearing.findOneAndDelete({
    _id: hearingId,
    advocate: advocate._id,
  });

  if (!hearing) {
    throw new AppError(404, "Hearing not found");
  }

  return hearing;
};
