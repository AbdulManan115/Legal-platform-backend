import mongoose, { Document, Model, Schema, Types } from "mongoose";

export interface IAdvocateClient extends Document {
  advocate: Types.ObjectId;
  linkedUser?: Types.ObjectId;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  notes?: string;
  inviteCodeHash?: string;
  inviteExpiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const advocateClientSchema = new Schema<IAdvocateClient>(
  {
    advocate: {
      type: Schema.Types.ObjectId,
      ref: "AdvocateProfile",
      required: true,
      index: true,
    },

    linkedUser: {
      type: Schema.Types.ObjectId,
      ref: "User",
      index: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100,
    },

    phone: {
      type: String,
      required: true,
      trim: true,
      maxlength: 30,
    },

    email: {
      type: String,
      trim: true,
      lowercase: true,
      maxlength: 254,
    },

    address: {
      type: String,
      trim: true,
      maxlength: 500,
    },

    notes: {
      type: String,
      trim: true,
      maxlength: 2000,
    },

    inviteCodeHash: {
      type: String,
      select: false,
    },

    inviteExpiresAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  },
);

advocateClientSchema.index({
  advocate: 1,
  phone: 1,
});

advocateClientSchema.index({
  advocate: 1,
  email: 1,
});

export const AdvocateClient: Model<IAdvocateClient> =
  mongoose.model<IAdvocateClient>(
    "AdvocateClient",
    advocateClientSchema,
  );
