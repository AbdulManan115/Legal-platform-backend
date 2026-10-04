import mongoose, { Document, Model, Schema, Types } from "mongoose";

export type HearingStatus =
  | "scheduled"
  | "completed"
  | "adjourned"
  | "cancelled";

export interface IHearing extends Document {
  case: Types.ObjectId;
  advocate: Types.ObjectId;
  court: string;
  judge?: string;
  dateTime: Date;
  notes?: string;
  status: HearingStatus;
  reminder1DaySent: boolean;
  reminder7DaySent: boolean;
  reminderSameDaySent: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const hearingSchema = new Schema<IHearing>(
  {
    case: {
      type: Schema.Types.ObjectId,
      ref: "Case",
      required: true,
      index: true,
    },

    advocate: {
      type: Schema.Types.ObjectId,
      ref: "AdvocateProfile",
      required: true,
      index: true,
    },

    court: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },

    judge: {
      type: String,
      trim: true,
      maxlength: 150,
    },

    dateTime: {
      type: Date,
      required: true,
      index: true,
    },

    notes: {
      type: String,
      trim: true,
      maxlength: 3000,
    },

    status: {
      type: String,
      enum: [
        "scheduled",
        "completed",
        "adjourned",
        "cancelled",
      ],
      default: "scheduled",
      index: true,
    },

    reminder1DaySent: {
      type: Boolean,
      default: false,
    },

    reminder7DaySent: {
      type: Boolean,
      default: false,
    },

    reminderSameDaySent: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

hearingSchema.index({
  advocate: 1,
  dateTime: 1,
});

hearingSchema.index({
  case: 1,
  dateTime: 1,
});

export const Hearing: Model<IHearing> =
  mongoose.model<IHearing>("Hearing", hearingSchema);
