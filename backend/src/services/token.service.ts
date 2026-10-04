import crypto from "node:crypto";
import {
  signAccessToken,
  signRefreshToken,
} from "../utils/jwt";

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  refreshTokenHash: string;
  refreshTokenExpiresAt: Date;
}

export const createTokenPair = (user: {
  userId: string;
  role: "client" | "advocate" | "admin";
}): TokenPair => {
  const tokenId = crypto.randomUUID();

  const accessToken = signAccessToken({
    userId: user.userId,
    role: user.role,
  });

  const refreshToken = signRefreshToken({
    userId: user.userId,
    tokenId,
  });

  const refreshTokenHash = crypto
    .createHash("sha256")
    .update(refreshToken)
    .digest("hex");

  const refreshTokenExpiresAt = new Date(
    Date.now() + 30 * 24 * 60 * 60 * 1000,
  );

  return {
    accessToken,
    refreshToken,
    refreshTokenHash,
    refreshTokenExpiresAt,
  };
};
