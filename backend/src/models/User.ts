import mongoose, { Document, Model, Schema } from "mongoose";

export type UserRole = "client" | "advocate" | "admin";
export type UserStatus = "active" | "suspended";

export interface IRefreshToken {
  tokenHash: string;
  expiresAt: Date;
  userAgent?: string;
}

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash: string;
  phone?: string;
  role: UserRole;
  status: UserStatus;
  avatarUrl?: string;
  lastLoginAt?: Date;
  refreshTokens: IRefreshToken[];
  createdAt: Date;
  updatedAt: Date;
}

const refreshTokenSchema = new Schema<IRefreshToken>(
  {
    tokenHash: {
      type: String,
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    userAgent: {
      type: String,
      trim: true,
      maxlength: 500,
    },
  },
  { _id: false },
);

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },

    passwordHash: {
      type: String,
      required: true,
      select: false,
    },

    phone: {
      type: String,
      trim: true,
      maxlength: 30,
    },

    role: {
      type: String,
      enum: ["client", "advocate", "admin"],
      required: true,
      default: "client",
      index: true,
    },

    status: {
      type: String,
      enum: ["active", "suspended"],
      required: true,
      default: "active",
      index: true,
    },

    avatarUrl: {
      type: String,
      trim: true,
    },

    lastLoginAt: {
      type: Date,
    },

    refreshTokens: {
      type: [refreshTokenSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  },
);

export const User: Model<IUser> = mongoose.model<IUser>("User", userSchema);
