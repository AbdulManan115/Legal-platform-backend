import mongoose, { Document, Model, Schema, Types } from "mongoose";

export type ReviewStatus = "visible" | "hidden";

export interface IReview extends Document {
  advocate: Types.ObjectId;
  client: Types.ObjectId;
  appointment: Types.ObjectId;
  rating: number;
  comment?: string;
  status: ReviewStatus;
  createdAt: Date;
  updatedAt: Date;
}

const reviewSchema = new Schema<IReview>(
  {
    advocate: {
      type: Schema.Types.ObjectId,
      ref: "AdvocateProfile",
      required: true,
      index: true,
    },

    client: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    appointment: {
      type: Schema.Types.ObjectId,
      ref: "Appointment",
      required: true,
      unique: true,
      index: true,
    },

    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },

    comment: {
      type: String,
      trim: true,
      maxlength: 2000,
    },

    status: {
      type: String,
      enum: ["visible", "hidden"],
      default: "visible",
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

reviewSchema.index({ advocate: 1, status: 1, createdAt: -1 });
reviewSchema.index({ client: 1, createdAt: -1 });

export const Review: Model<IReview> = mongoose.model<IReview>(
  "Review",
  reviewSchema,
);
