import mongoose, { Document, Model, Schema } from "mongoose";

export interface ILegalCategory extends Document {
  name: string;
  slug: string;
  description: string;
  icon?: string;
  keywords: string[];
  synonyms: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const legalCategorySchema = new Schema<ILegalCategory>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },

    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },

    icon: {
      type: String,
      trim: true,
      maxlength: 100,
    },

    keywords: {
      type: [String],
      default: [],
      index: true,
    },

    synonyms: {
      type: [String],
      default: [],
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

export const LegalCategory: Model<ILegalCategory> =
  mongoose.model<ILegalCategory>("LegalCategory", legalCategorySchema);
