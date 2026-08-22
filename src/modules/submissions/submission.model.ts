import mongoose, { Schema, type Document } from "mongoose";
import { SUBMISSION_STATUSES, TESTIMONIAL_TYPES } from "./submission.types.js";
import type { BaseSubmission } from "./submission.types.js";

export interface ISubmission extends BaseSubmission<Date>, Document {}

const submissionSchema = new Schema<ISubmission>(
  {
    customer: {
      name: { type: String, required: true, trim: true, maxlength: 200 },
      email: { type: String, required: true, trim: true, lowercase: true, maxlength: 320 },
      company: { type: String, required: true, trim: true, maxlength: 200 },
      jobTitle: { type: String, required: true, trim: true, maxlength: 200 },
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    testimonial: {
      text: { type: String, required: true, trim: true, maxlength: 5000 },
      type: {
        type: String,
        required: true,
        enum: Object.values(TESTIMONIAL_TYPES),
      },
      sourceUrl: { type: String, trim: true, maxlength: 2048 },
    },
    status: {
      type: String,
      required: true,
      enum: Object.values(SUBMISSION_STATUSES),
      default: SUBMISSION_STATUSES.PENDING,
    },
    reviewedBy: { type: String },
    reviewedAt: { type: Date },
  },
  {
    timestamps: true,
  }
);

// ─── Indexes ─────────────────────────────────────────────
// Primary review queue query: filter by status, sort by date
submissionSchema.index({ status: 1, createdAt: -1 });

// Filtered queue: status + type + date
submissionSchema.index({ status: 1, "testimonial.type": 1, createdAt: -1 });

// Rating filter
submissionSchema.index({ rating: 1 });

// Email lookup (for duplicate checks or notifications)
submissionSchema.index({ "customer.email": 1 });

// Text search across customer name, email, company, and testimonial text
submissionSchema.index(
  {
    "customer.name": "text",
    "customer.email": "text",
    "customer.company": "text",
    "testimonial.text": "text",
  },
  {
    weights: {
      "customer.name": 10,
      "customer.company": 5,
      "customer.email": 3,
      "testimonial.text": 1,
    },
    name: "submission_text_search",
  }
);

export const Submission = mongoose.model<ISubmission>("Submission", submissionSchema);
