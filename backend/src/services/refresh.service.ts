import crypto from "node:crypto";
import { User } from "../models/User";
import { AppError } from "../utils/AppError";
import {
  signAccessToken,
  verifyRefreshToken,
} from "../utils/jwt";

export const refreshAccessToken = async (
  refreshToken: string,
) => {
  let payload;

  try {
    payload = verifyRefreshToken(refreshToken);
  } catch {
    throw new AppError(401, "Invalid or expired refresh token");
  }

  const user = await User.findById(payload.userId);

  if (!user || user.status !== "active") {
    throw new AppError(401, "Invalid refresh token");
  }

  const tokenHash = crypto
    .createHash("sha256")
    .update(refreshToken)
    .digest("hex");

  const storedToken = user.refreshTokens.find(
    (token) =>
      token.tokenHash === tokenHash &&
      token.expiresAt.getTime() > Date.now(),
  );

  if (!storedToken) {
    throw new AppError(401, "Invalid or expired refresh token");
  }

  const accessToken = signAccessToken({
    userId: user._id.toString(),
    role: user.role,
  });

  return {
    accessToken,
    user: {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      status: user.status,
    },
  };
};
