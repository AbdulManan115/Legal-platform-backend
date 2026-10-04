import { User } from "../models/User";
import type {
  LoginInput,
  RegisterInput,
} from "../validators/auth.validators";
import {
  comparePassword,
  hashPassword,
} from "../utils/password";
import { AppError } from "../utils/AppError";
import { createTokenPair } from "./token.service";

export const registerUser = async (
  input: RegisterInput,
) => {
  const existingUser = await User.findOne({
    email: input.email.toLowerCase(),
  });

  if (existingUser) {
    throw new AppError(409, "Email is already registered");
  }

  const passwordHash = await hashPassword(input.password);

  const user = await User.create({
    name: input.name,
    email: input.email.toLowerCase(),
    passwordHash,
    phone: input.phone,
    role: input.role,
    status: "active",
    refreshTokens: [],
  });

  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    status: user.status,
  };
};

export const loginUser = async (
  input: LoginInput,
) => {
  const user = await User.findOne({
    email: input.email.toLowerCase(),
  }).select("+passwordHash");

  if (!user) {
    throw new AppError(401, "Invalid email or password");
  }

  if (user.status !== "active") {
    throw new AppError(403, "Your account is suspended");
  }

  const passwordValid = await comparePassword(
    input.password,
    user.passwordHash,
  );

  if (!passwordValid) {
    throw new AppError(401, "Invalid email or password");
  }

  user.lastLoginAt = new Date();

  const tokens = createTokenPair({
    userId: user._id.toString(),
    role: user.role,
  });

  user.refreshTokens.push({
    tokenHash: tokens.refreshTokenHash,
    expiresAt: tokens.refreshTokenExpiresAt,
  });

  await user.save();

  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    status: user.status,
    tokens,
  };
};
