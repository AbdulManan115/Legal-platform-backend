import mongoose, { Document, Model, Schema, Types } from "mongoose";

export type CaseHistoryType =
  | "created"
  | "updated"
  | "status_changed"
  | "note_added"
  | "hearing_updated"
  | "document_added"
  | "custom";

export interface ICaseHistory extends Document {
  case: Types.ObjectId;
  advocate: Types.ObjectId;
  type: CaseHistoryType;
  message: string;
  createdBy: Types.ObjectId;
  createdAt: Date;
}

const caseHistorySchema = new Schema<ICaseHistory>(
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

    type: {
      type: String,
      enum: [
        "created",
        "updated",
        "status_changed",
        "note_added",
        "hearing_updated",
        "document_added",
        "custom",
      ],
      required: true,
    },

    message: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 2000,
    },

    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  },
);

caseHistorySchema.index({
  case: 1,
  createdAt: -1,
});

export const CaseHistory: Model<ICaseHistory> =
  mongoose.model<ICaseHistory>("CaseHistory", caseHistorySchema);
