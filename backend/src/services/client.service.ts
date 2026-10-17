import { AdvocateClient } from "../models/AdvocateClient";
import { Appointment } from "../models/Appointment";
import { AdvocateProfile } from "../models/AdvocateProfile";
import { AppError } from "../utils/AppError";
import type {
  CreateClientInput,
  UpdateClientInput,
} from "../validators/client.validators";

const getAdvocateProfile = async (userId: string) => {
  const advocate = await AdvocateProfile.findOne({
    user: userId,
  }).select("_id");

  if (!advocate) {
    throw new AppError(404, "Advocate profile not found");
  }

  return advocate;
};

export const createClient = async (
  userId: string,
  input: CreateClientInput,
) => {
  const advocate = await getAdvocateProfile(userId);

  const existingClient = await AdvocateClient.findOne({
    advocate: advocate._id,
    phone: input.phone,
  });

  if (existingClient) {
    throw new AppError(
      409,
      "A client with this phone number already exists",
    );
  }

  return AdvocateClient.create({
    advocate: advocate._id,
    name: input.name,
    phone: input.phone,
    email: input.email?.toLowerCase(),
    address: input.address,
    notes: input.notes,
  });
};

export const getAppointmentCandidates = async (userId: string) => {
  const advocate = await getAdvocateProfile(userId);

  const appointments = await Appointment.find({
    advocate: advocate._id,
    status: { $in: ["confirmed", "completed"] },
  })
    .sort({ startAt: -1 })
    .populate({
      path: "client",
      select: "name email phone",
    })
    .lean();

  const existingClients = await AdvocateClient.find({
    advocate: advocate._id,
    linkedUser: { $exists: true, $ne: null },
  })
    .select("linkedUser")
    .lean();

  const existingUserIds = new Set(
    existingClients
      .map((client) => client.linkedUser?.toString())
      .filter(Boolean),
  );

  const seen = new Set<string>();

  return appointments
    .filter((appointment) => {
      const client = appointment.client as {
        _id?: unknown;
        name?: string;
        email?: string;
        phone?: string;
      } | null;

      if (!client?._id) return false;

      const userId = client._id.toString();

      if (existingUserIds.has(userId)) return false;
      if (seen.has(userId)) return false;

      seen.add(userId);
      return true;
    })
    .map((appointment) => ({
      appointmentId: appointment._id,
      client: appointment.client,
      appointmentDate: appointment.startAt,
    }));
};

export const addAppointmentClient = async (
  userId: string,
  appointmentId: string,
) => {
  const advocate = await getAdvocateProfile(userId);

  const appointment = await Appointment.findOne({
    _id: appointmentId,
    advocate: advocate._id,
    status: { $in: ["confirmed", "completed"] },
  }).populate({
    path: "client",
    select: "name email phone",
  });

  if (!appointment) {
    throw new AppError(404, "Appointment client not found");
  }

  const clientUser = appointment.client as unknown as {
    _id: import("mongoose").Types.ObjectId;
    name: string;
    email?: string;
    phone?: string;
  };

  const existingClient = await AdvocateClient.findOne({
    advocate: advocate._id,
    linkedUser: clientUser._id,
  });

  if (existingClient) {
    return existingClient;
  }

  const existingByPhone = clientUser.phone
    ? await AdvocateClient.findOne({
        advocate: advocate._id,
        phone: clientUser.phone,
      })
    : null;

  if (existingByPhone) {
    existingByPhone.linkedUser = clientUser._id;
    if (!existingByPhone.email && clientUser.email) {
      existingByPhone.email = clientUser.email.toLowerCase();
    }
    await existingByPhone.save();
    return existingByPhone;
  }

  return AdvocateClient.create({
    advocate: advocate._id,
    linkedUser: clientUser._id,
    name: clientUser.name,
    phone: clientUser.phone || "N/A",
    email: clientUser.email?.toLowerCase(),
  });
};

export const getMyClients = async (userId: string) => {
  const advocate = await getAdvocateProfile(userId);

  return AdvocateClient.find({
    advocate: advocate._id,
  })
    .sort({ createdAt: -1 })
    .populate({
      path: "linkedUser",
      select: "name email phone status",
    })
    .lean();
};

export const getClient = async (
  userId: string,
  clientId: string,
) => {
  const advocate = await getAdvocateProfile(userId);

  const client = await AdvocateClient.findOne({
    _id: clientId,
    advocate: advocate._id,
  })
    .populate({
      path: "linkedUser",
      select: "name email phone status",
    })
    .lean();

  if (!client) {
    throw new AppError(404, "Client not found");
  }

  return client;
};

export const updateClient = async (
  userId: string,
  clientId: string,
  input: UpdateClientInput,
) => {
  const advocate = await getAdvocateProfile(userId);

  const client = await AdvocateClient.findOne({
    _id: clientId,
    advocate: advocate._id,
  });

  if (!client) {
    throw new AppError(404, "Client not found");
  }

  if (input.phone && input.phone !== client.phone) {
    const duplicate = await AdvocateClient.findOne({
      _id: { $ne: client._id },
      advocate: advocate._id,
      phone: input.phone,
    });

    if (duplicate) {
      throw new AppError(
        409,
        "A client with this phone number already exists",
      );
    }
  }

  if (input.name !== undefined) client.name = input.name;
  if (input.phone !== undefined) client.phone = input.phone;
  if (input.email !== undefined) client.email = input.email.toLowerCase();
  if (input.address !== undefined) client.address = input.address;
  if (input.notes !== undefined) client.notes = input.notes;

  await client.save();

  return client;
};

export const deleteClient = async (
  userId: string,
  clientId: string,
) => {
  const advocate = await getAdvocateProfile(userId);

  const client = await AdvocateClient.findOneAndDelete({
    _id: clientId,
    advocate: advocate._id,
  });

  if (!client) {
    throw new AppError(404, "Client not found");
  }

  return client;
};
