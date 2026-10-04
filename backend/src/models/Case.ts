import mongoose, { Document, Model, Schema, Types } from "mongoose";

export type CaseStatus = "active" | "pending" | "closed" | "urgent";

export interface ICase extends Document {
  advocate: Types.ObjectId;
  client: Types.ObjectId;
  caseCode: string;
  caseNumber?: string;
  title: string;
  caseType: string;
  court: string;
  judge?: string;
  oppositeParty?: string;
  description?: string;
  filingDate?: Date;
  status: CaseStatus;
  importantNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const caseSchema = new Schema<ICase>(
  {
    advocate: {
      type: Schema.Types.ObjectId,
      ref: "AdvocateProfile",
      required: true,
      index: true,
    },

    client: {
      type: Schema.Types.ObjectId,
      ref: "AdvocateClient",
      required: true,
      index: true,
    },

    caseCode: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
      maxlength: 30,
    },

    caseNumber: {
      type: String,
      trim: true,
      maxlength: 100,
    },

    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 200,
    },

    caseType: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
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

    oppositeParty: {
      type: String,
      trim: true,
      maxlength: 200,
    },

    description: {
      type: String,
      trim: true,
      maxlength: 3000,
    },

    filingDate: {
      type: Date,
    },

    status: {
      type: String,
      enum: ["active", "pending", "closed", "urgent"],
      default: "pending",
      index: true,
    },

    importantNotes: {
      type: String,
      trim: true,
      maxlength: 3000,
    },
  },
  {
    timestamps: true,
  },
);

caseSchema.index(
  { advocate: 1, caseCode: 1 },
  { unique: true },
);

caseSchema.index({
  advocate: 1,
  status: 1,
});

caseSchema.index({
  advocate: 1,
  client: 1,
});

export const Case: Model<ICase> = mongoose.model<ICase>(
  "Case",
  caseSchema,
);
