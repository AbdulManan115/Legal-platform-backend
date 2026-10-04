import mongoose, { Document, Model, Schema, Types } from "mongoose";

export interface IClientProfile extends Document {
  user: Types.ObjectId;
  city?: string;
  createdAt: Date;
  updatedAt: Date;
}

const clientProfileSchema = new Schema<IClientProfile>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },

    city: {
      type: String,
      trim: true,
      maxlength: 100,
    },
  },
  {
    timestamps: true,
  },
);

export const ClientProfile: Model<IClientProfile> =
  mongoose.model<IClientProfile>(
    "ClientProfile",
    clientProfileSchema,
  );