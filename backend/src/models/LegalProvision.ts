import mongoose, { Document, Model, Schema, Types } from "mongoose";

export interface ILegalProvision extends Document {
  category: Types.ObjectId;
  lawName: string;
  section: string;
  title: string;
  plainExplanation: string;
  keywords: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const legalProvisionSchema = new Schema<ILegalProvision>(
  {
    category: {
      type: Schema.Types.ObjectId,
      ref: "LegalCategory",
      required: true,
      index: true,
    },

    lawName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },

    section: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },

    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 300,
    },

    plainExplanation: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },

    keywords: {
      type: [String],
      default: [],
      index: true,
    },

    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

legalProvisionSchema.index({ category: 1, isActive: 1 });

export const LegalProvision: Model<ILegalProvision> =
  mongoose.model<ILegalProvision>("LegalProvision", legalProvisionSchema);
