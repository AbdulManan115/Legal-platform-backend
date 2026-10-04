import mongoose, { Document, Model, Schema, Types } from "mongoose";

export interface ISavedAdvocate extends Document {
  client: Types.ObjectId;
  advocate: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const savedAdvocateSchema = new Schema<ISavedAdvocate>(
  {
    client: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    advocate: {
      type: Schema.Types.ObjectId,
      ref: "AdvocateProfile",
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

savedAdvocateSchema.index(
  { client: 1, advocate: 1 },
  { unique: true },
);

export const SavedAdvocate: Model<ISavedAdvocate> =
  mongoose.model<ISavedAdvocate>(
    "SavedAdvocate",
    savedAdvocateSchema,
  );
