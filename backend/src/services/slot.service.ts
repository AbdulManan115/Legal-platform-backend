import { AdvocateProfile } from "../models/AdvocateProfile";
import { Appointment } from "../models/Appointment";
import { AppError } from "../utils/AppError";

const TIME_ZONE = "Asia/Karachi";

const getDateParts = (date: Date) => {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: TIME_ZONE,
    weekday: "short",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  const parts = formatter.formatToParts(date);

  const get = (type: string) =>
    parts.find((part) => part.type === type)?.value ?? "";

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
    year: Number(get("year")),
    month: Number(get("month")),
    dayOfMonth: Number(get("day")),
    weekday: weekdayMap[get("weekday")],
  };
};

const getDateKey = (date: Date): string => {
  const parts = getDateParts(date);

  return [
    parts.year,
    String(parts.month).padStart(2, "0"),
    String(parts.dayOfMonth).padStart(2, "0"),
  ].join("-");
};

const createPakistanDate = (
  dateKey: string,
  time: string,
): Date => {
  return new Date(
    `${dateKey}T${time}:00+05:00`,
  );
};

const getNextDates = (days: number): Date[] => {
  const dates: Date[] = [];

  for (let index = 0; index < days; index += 1) {
    const date = new Date();
    date.setDate(date.getDate() + index);
    dates.push(date);
  }

  return dates;
};

export const getAvailableSlots = async (
  advocateId: string,
  days = 7,
) => {
  const advocate = await AdvocateProfile.findOne({
    _id: advocateId,
    "verification.status": "verified",
    isListed: true,
  }).lean();

  if (!advocate) {
    throw new AppError(404, "Advocate not found");
  }

  const weeklyMap = new Map(
    advocate.availability.weekly.map((item) => [
      item.day,
      item,
    ]),
  );

  const blockedDates = new Set(
    advocate.availability.blockedDates.map((item) =>
      getDateKey(new Date(item.date)),
    ),
  );

  const from = new Date();
  const to = new Date(
    from.getTime() +
      days * 24 * 60 * 60 * 1000,
  );

  const bookedAppointments =
    await Appointment.find({
      advocate: advocate._id,
      status: {
        $in: ["pending", "confirmed"],
      },
      startAt: {
        $lt: to,
      },
      endAt: {
        $gt: from,
      },
    })
      .select("startAt endAt")
      .lean();

  const slots: Array<{
    startAt: string;
    endAt: string;
  }> = [];

  const slotDuration =
    advocate.availability.slotDurationMins;

  for (const date of getNextDates(days)) {
    const { weekday } = getDateParts(date);
    const weekly = weeklyMap.get(weekday);

    if (!weekly?.enabled) {
      continue;
    }

    const dateKey = getDateKey(date);

    if (blockedDates.has(dateKey)) {
      continue;
    }

    const [startHour, startMinute] =
      weekly.startTime.split(":").map(Number);

    const [endHour, endMinute] =
      weekly.endTime.split(":").map(Number);

    let minutes =
      startHour * 60 + startMinute;

    const endMinutes =
      endHour * 60 + endMinute;

    while (minutes + slotDuration <= endMinutes) {
      const hour = Math.floor(minutes / 60);
      const minute = minutes % 60;

      const startTime =
        `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;

      const endTotal = minutes + slotDuration;
      const endHourValue = Math.floor(
        endTotal / 60,
      );
      const endMinuteValue = endTotal % 60;

      const endTime =
        `${String(endHourValue).padStart(2, "0")}:${String(endMinuteValue).padStart(2, "0")}`;

      const startAt = createPakistanDate(
        dateKey,
        startTime,
      );

      const endAt = createPakistanDate(
        dateKey,
        endTime,
      );

      const overlaps = bookedAppointments.some(
        (appointment) =>
          new Date(appointment.startAt) < endAt &&
          new Date(appointment.endAt) > startAt,
      );

      if (
        !overlaps &&
        startAt.getTime() > Date.now()
      ) {
        slots.push({
          startAt: startAt.toISOString(),
          endAt: endAt.toISOString(),
        });
      }

      minutes += slotDuration;
    }
  }

  return {
    slotDurationMins: slotDuration,
    timezone: TIME_ZONE,
    slots,
  };
};
