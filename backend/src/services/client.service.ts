import { AdvocateClient } from "../models/AdvocateClient";
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
