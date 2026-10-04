import cron from "node-cron";
import { Hearing } from "../models/Hearing";
import { Case } from "../models/Case";
import { AdvocateClient } from "../models/AdvocateClient";
import { AdvocateProfile } from "../models/AdvocateProfile";
import { createNotification } from "../services/notification.service";
import { Types } from "mongoose";

const sendReminder = async (
  hearingId: Types.ObjectId,
  reminderType: "7day" | "1day" | "sameDay",
): Promise<void> => {
  const hearing = await Hearing.findById(hearingId).lean();

  if (!hearing) {
    return;
  }

  const caseRecord = await Case.findById(hearing.case).lean();

  if (!caseRecord) {
    return;
  }

  const advocateProfile = await AdvocateProfile.findById(
    hearing.advocate,
  ).lean();

  if (!advocateProfile) {
    return;
  }

  const hearingDate = new Date(hearing.dateTime);

  const dateText = hearingDate.toLocaleString("en-PK", {
    timeZone: "Asia/Karachi",
    dateStyle: "medium",
    timeStyle: "short",
  });

  let title = "";
  let message = "";

  if (reminderType === "7day") {
    title = "Hearing Reminder — 7 Days";
    message = `Your hearing for case ${caseRecord.caseCode} is scheduled on ${dateText}.`;
  }

  if (reminderType === "1day") {
    title = "Hearing Reminder — Tomorrow";
    message = `Your hearing for case ${caseRecord.caseCode} is tomorrow at ${dateText}.`;
  }

  if (reminderType === "sameDay") {
    title = "Hearing Reminder — Today";
    message = `Your hearing for case ${caseRecord.caseCode} is scheduled today at ${dateText}.`;
  }

  await createNotification({
    userId: advocateProfile.user,
    type: "hearing_reminder",
    title,
    message,
    link: `/advocate/cases/${caseRecord._id}`,
  });

  const client = await AdvocateClient.findById(caseRecord.client).lean();

  if (client?.linkedUser) {
    await createNotification({
      userId: client.linkedUser,
      type: "hearing_reminder",
      title,
      message: `Your case ${caseRecord.caseCode} has a hearing scheduled on ${dateText}.`,
      link: `/client/cases/${caseRecord._id}`,
    });
  }

  const update: Record<string, boolean> = {};

  if (reminderType === "7day") {
    update.reminder7DaySent = true;
  }

  if (reminderType === "1day") {
    update.reminder1DaySent = true;
  }

  if (reminderType === "sameDay") {
    update.reminderSameDaySent = true;
  }

  await Hearing.findByIdAndUpdate(hearingId, {
    $set: update,
  });
};

const processHearingReminders = async (): Promise<void> => {
  const now = new Date();

  const sevenDayStart = new Date(now.getTime() + 6.5 * 24 * 60 * 60 * 1000);
  const sevenDayEnd = new Date(now.getTime() + 7.5 * 24 * 60 * 60 * 1000);

  const oneDayStart = new Date(now.getTime() + 23 * 60 * 60 * 1000);
  const oneDayEnd = new Date(now.getTime() + 25 * 60 * 60 * 1000);

  const sameDayStart = now;
  const sameDayEnd = new Date(now.getTime() + 2 * 60 * 60 * 1000);

  const sevenDayHearings = await Hearing.find({
    status: "scheduled",
    dateTime: {
      $gte: sevenDayStart,
      $lte: sevenDayEnd,
    },
    reminder7DaySent: false,
  })
    .select("_id")
    .lean();

  for (const hearing of sevenDayHearings) {
    await sendReminder(hearing._id, "7day");
  }

  const oneDayHearings = await Hearing.find({
    status: "scheduled",
    dateTime: {
      $gte: oneDayStart,
      $lte: oneDayEnd,
    },
    reminder1DaySent: false,
  })
    .select("_id")
    .lean();

  for (const hearing of oneDayHearings) {
    await sendReminder(hearing._id, "1day");
  }

  const sameDayHearings = await Hearing.find({
    status: "scheduled",
    dateTime: {
      $gte: sameDayStart,
      $lte: sameDayEnd,
    },
    reminderSameDaySent: false,
  })
    .select("_id")
    .lean();

  for (const hearing of sameDayHearings) {
    await sendReminder(hearing._id, "sameDay");
  }
};

export const startHearingReminderJob = (): void => {
  cron.schedule("0 * * * *", () => {
    void processHearingReminders().catch((error) => {
      console.error("❌ Hearing reminder job failed:", error);
    });
  });

  console.log("⏰ Hearing reminder job started — runs every hour");
};
