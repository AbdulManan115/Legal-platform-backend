import mongoose, { Document, Model, Schema, Types } from "mongoose";

export type CaseDocumentCategory =
  | "fir"
  | "evidence"
  | "application"
  | "court_order"
  | "agreement"
  | "other";

export interface ICaseDocument extends Document {
  case: Types.ObjectId;
  advocate: Types.ObjectId;
  category: CaseDocumentCategory;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  storageKey: string;
  uploadedBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const caseDocumentSchema = new Schema<ICaseDocument>(
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

    category: {
      type: String,
      enum: [
        "fir",
        "evidence",
        "application",
        "court_order",
        "agreement",
        "other",
      ],
      required: true,
    },

    originalName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 255,
    },

    mimeType: {
      type: String,
      required: true,
      trim: true,
    },

    sizeBytes: {
      type: Number,
      required: true,
      min: 1,
    },

    storageKey: {
      type: String,
      required: true,
      unique: true,
    },

    uploadedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

caseDocumentSchema.index({
  case: 1,
  createdAt: -1,
});

export const CaseDocument: Model<ICaseDocument> =
  mongoose.model<ICaseDocument>(
    "CaseDocument",
    caseDocumentSchema,
  );
