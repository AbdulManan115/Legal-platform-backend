import type { Request, Response } from "express";
import {
  loginSchema,
  registerSchema,
  changePasswordSchema,
  updateMeSchema,
} from "../validators/auth.validators";
import {
  loginUser,
  registerUser,
} from "../services/auth.service";
import { AppError } from "../utils/AppError";
import { refreshTokenCookieOptions } from "../config/cookies";
import { refreshAccessToken } from "../services/refresh.service";
import { User } from "../models/User";
import { comparePassword, hashPassword } from "../utils/password";
import crypto from "node:crypto";

export const register = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const result = registerSchema.safeParse(req.body);

  if (!result.success) {
    throw new AppError(400, "Validation failed", result.error.issues);
  }

  const user = await registerUser(result.data);

  res.status(201).json({
    success: true,
    message: "Account created successfully",
    data: {
      user,
    },
  });
};

export const login = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const result = loginSchema.safeParse(req.body);

  if (!result.success) {
    throw new AppError(400, "Validation failed", result.error.issues);
  }

  const user = await loginUser(result.data);

  res.cookie(
    "refreshToken",
    user.tokens.refreshToken,
    refreshTokenCookieOptions,
  );

  res.status(200).json({
    success: true,
    message: "Login successful",
    data: {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        status: user.status,
      },
      accessToken: user.tokens.accessToken,
    },
  });
};

export const refresh = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const refreshToken = req.cookies?.refreshToken;

  if (!refreshToken) {
    throw new AppError(401, "Refresh token required");
  }

  const result = await refreshAccessToken(refreshToken);

  res.status(200).json({
    success: true,
    message: "Access token refreshed",
    data: result,
  });
};

export const logout = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const refreshToken = req.cookies?.refreshToken;

  if (refreshToken) {
    const tokenHash = crypto
      .createHash("sha256")
      .update(refreshToken)
      .digest("hex");

    await User.updateOne(
      { "refreshTokens.tokenHash": tokenHash },
      {
        $pull: {
          refreshTokens: {
            tokenHash,
          },
        },
      },
    );
  }

  res.clearCookie("refreshToken", refreshTokenCookieOptions);

  res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
};

export const me = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const userId = (req as Request & {
    user?: { userId: string };
  }).user?.userId;

  if (!userId) {
    throw new AppError(401, "Authentication required");
  }

  const user = await User.findById(userId).select(
    "name email phone role status avatarUrl lastLoginAt createdAt",
  );

  if (!user) {
    throw new AppError(404, "User not found");
  }

  res.status(200).json({
    success: true,
    data: {
      user,
    },
  });
};

export const updateMe = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const userId = (req as Request & {
    user?: { userId: string };
  }).user?.userId;

  if (!userId) {
    throw new AppError(401, "Authentication required");
  }

  const result = updateMeSchema.safeParse(req.body);

  if (!result.success) {
    throw new AppError(400, "Validation failed", result.error.issues);
  }

  const user = await User.findById(userId);

  if (!user) {
    throw new AppError(404, "User not found");
  }

  if (result.data.name !== undefined) {
    user.name = result.data.name;
  }

  if (result.data.phone !== undefined) {
    user.phone = result.data.phone;
  }

  if (result.data.avatarUrl !== undefined) {
    user.avatarUrl = result.data.avatarUrl;
  }

  await user.save();

  res.status(200).json({
    success: true,
    message: "Profile updated successfully",
    data: {
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        status: user.status,
        avatarUrl: user.avatarUrl,
      },
    },
  });
};

export const changePassword = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const userId = (req as Request & {
    user?: { userId: string };
  }).user?.userId;

  if (!userId) {
    throw new AppError(401, "Authentication required");
  }

  const result = changePasswordSchema.safeParse(req.body);

  if (!result.success) {
    throw new AppError(400, "Validation failed", result.error.issues);
  }

  const user = await User.findById(userId).select("+passwordHash");

  if (!user) {
    throw new AppError(404, "User not found");
  }

  const passwordValid = await comparePassword(
    result.data.currentPassword,
    user.passwordHash,
  );

  if (!passwordValid) {
    throw new AppError(400, "Current password is incorrect");
  }

  user.passwordHash = await hashPassword(result.data.newPassword);

  user.refreshTokens = [];

  await user.save();

  res.status(200).json({
    success: true,
    message: "Password changed successfully. Please log in again.",
  });
};
