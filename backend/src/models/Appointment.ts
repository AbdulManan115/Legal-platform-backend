import mongoose, { Document, Model, Schema, Types } from "mongoose";

export type AppointmentStatus =
  | "pending"
  | "confirmed"
  | "rejected"
  | "cancelled"
  | "completed";

export interface IAppointment extends Document {
  advocate: Types.ObjectId;
  client: Types.ObjectId;
  startAt: Date;
  endAt: Date;
  issueDescription: string;
  status: AppointmentStatus;
  cancelledBy?: Types.ObjectId;
  rejectionReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const appointmentSchema = new Schema<IAppointment>(
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

    startAt: {
      type: Date,
      required: true,
      index: true,
    },

    endAt: {
      type: Date,
      required: true,
    },

    issueDescription: {
      type: String,
      required: true,
      trim: true,
      minlength: 5,
      maxlength: 2000,
    },

    status: {
      type: String,
      enum: [
        "pending",
        "confirmed",
        "rejected",
        "cancelled",
        "completed",
      ],
      default: "pending",
      index: true,
    },

    cancelledBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },

    rejectionReason: {
      type: String,
      trim: true,
      maxlength: 1000,
    },
  },
  {
    timestamps: true,
  },
);

appointmentSchema.index({
  advocate: 1,
  startAt: 1,
  endAt: 1,
});

appointmentSchema.index({
  client: 1,
  startAt: 1,
});

export const Appointment: Model<IAppointment> =
  mongoose.model<IAppointment>(
    "Appointment",
    appointmentSchema,
  );
