import mongoose, { Schema, type Document } from "mongoose";
import { SUBMISSION_STATUSES, type SubmissionStatus } from "../submissions/submission.types.js";

export interface INotification extends Document {
  submissionId: mongoose.Types.ObjectId;
  recipientEmail: string;
  type: SubmissionStatus;
  message: string;
  createdAt: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    submissionId: {
      type: Schema.Types.ObjectId,
      ref: "Submission",
      required: true,
    },
    recipientEmail: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    type: {
      type: String,
      required: true,
      enum: [SUBMISSION_STATUSES.APPROVED, SUBMISSION_STATUSES.REJECTED],
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

// Index for looking up notifications by submission
notificationSchema.index({ submissionId: 1 });

// Index for listing notifications by date
notificationSchema.index({ createdAt: -1 });

export const Notification = mongoose.model<INotification>(
  "Notification",
  notificationSchema
);
