import mongoose, { Document, Model, Schema, Types } from "mongoose";

export type VerificationStatus =
  | "pending"
  | "verified"
  | "rejected";

export type ConsultationMode = "online" | "in_person" | "both";

export interface IWeeklyAvailability {
  day: number;
  enabled: boolean;
  startTime: string;
  endTime: string;
}

export interface IBlockedDate {
  date: Date;
  reason?: string;
}

export interface IVerification {
  status: VerificationStatus;
  documents: string[];
  submittedAt?: Date;
  reviewedBy?: Types.ObjectId;
  reviewedAt?: Date;
  rejectionReason?: string;
}

export interface ISubscription {
  plan: "free" | "pro";
  status: "inactive" | "active" | "cancelled";
  expiresAt?: Date;
}

export interface IAdvocateProfile extends Document {
  user: Types.ObjectId;
  slug: string;
  headline?: string;
  bio?: string;
  city: string;
  province: string;
  address?: string;
  publicPhone?: string;
  publicEmail?: string;
  qualification: string;
  experienceYears: number;
  practiceAreas: string[];
  barCouncil?: string;
  licenseNumber?: string;
  consultationFee?: number;
  consultationModes: ConsultationMode[];
  availability: {
    slotDurationMins: number;
    weekly: IWeeklyAvailability[];
    blockedDates: IBlockedDate[];
  };
  verification: IVerification;
  ratingAverage: number;
  ratingCount: number;
  isListed: boolean;
  subscription: ISubscription;
  createdAt: Date;
  updatedAt: Date;
}

const weeklyAvailabilitySchema = new Schema<IWeeklyAvailability>(
  {
    day: {
      type: Number,
      required: true,
      min: 0,
      max: 6,
    },
    enabled: {
      type: Boolean,
      default: false,
    },
    startTime: {
      type: String,
      default: "09:00",
    },
    endTime: {
      type: String,
      default: "17:00",
    },
  },
  { _id: false },
);

const blockedDateSchema = new Schema<IBlockedDate>(
  {
    date: {
      type: Date,
      required: true,
    },
    reason: {
      type: String,
      trim: true,
      maxlength: 300,
    },
  },
  { _id: false },
);

const advocateProfileSchema = new Schema<IAdvocateProfile>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },

    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },

    headline: {
      type: String,
      trim: true,
      maxlength: 200,
    },

    bio: {
      type: String,
      trim: true,
      maxlength: 3000,
    },

    city: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
      index: true,
    },

    province: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },

    address: {
      type: String,
      trim: true,
      maxlength: 300,
    },

    publicPhone: {
      type: String,
      trim: true,
      maxlength: 30,
    },

    publicEmail: {
      type: String,
      trim: true,
      lowercase: true,
      maxlength: 254,
    },

    qualification: {
      type: String,
      required: true,
      trim: true,
      maxlength: 300,
    },

    experienceYears: {
      type: Number,
      required: true,
      min: 0,
      max: 70,
      default: 0,
    },

    practiceAreas: {
      type: [String],
      required: true,
      default: [],
    },

    barCouncil: {
      type: String,
      trim: true,
      maxlength: 200,
    },

    licenseNumber: {
      type: String,
      trim: true,
      maxlength: 100,
    },

    consultationFee: {
      type: Number,
      min: 0,
    },

    consultationModes: {
      type: [String],
      enum: ["online", "in_person", "both"],
      default: ["online"],
    },

    availability: {
      slotDurationMins: {
        type: Number,
        min: 15,
        max: 180,
        default: 30,
      },

      weekly: {
        type: [weeklyAvailabilitySchema],
        default: [],
      },

      blockedDates: {
        type: [blockedDateSchema],
        default: [],
      },
    },

    verification: {
      status: {
        type: String,
        enum: ["pending", "verified", "rejected"],
        default: "pending",
        index: true,
      },

      documents: {
        type: [String],
        default: [],
      },

      submittedAt: Date,

      reviewedBy: {
        type: Schema.Types.ObjectId,
        ref: "User",
      },

      reviewedAt: Date,

      rejectionReason: {
        type: String,
        trim: true,
        maxlength: 1000,
      },
    },

    ratingAverage: {
      type: Number,
      min: 0,
      max: 5,
      default: 0,
    },

    ratingCount: {
      type: Number,
      min: 0,
      default: 0,
    },

    isListed: {
      type: Boolean,
      default: false,
      index: true,
    },

    subscription: {
      plan: {
        type: String,
        enum: ["free", "pro"],
        default: "free",
      },

      status: {
        type: String,
        enum: ["inactive", "active", "cancelled"],
        default: "inactive",
      },

      expiresAt: Date,
    },
  },
  {
    timestamps: true,
  },
);

export const AdvocateProfile: Model<IAdvocateProfile> =
  mongoose.model<IAdvocateProfile>(
    "AdvocateProfile",
    advocateProfileSchema,
  );