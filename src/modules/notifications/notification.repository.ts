import { Notification } from "./notification.model.js";
import type { PaginatedResult } from "../submissions/submission.repository.js";
import type { PaginationInput } from "../submissions/submission.validation.js";
import type { SubmissionStatus } from "../submissions/submission.types.js";

export interface NotificationDoc {
  _id: string;
  submissionId: string;
  recipientEmail: string;
  type: SubmissionStatus;
  message: string;
  createdAt: Date;
}

export const notificationRepository = {
  async create(data: {
    submissionId: string;
    recipientEmail: string;
    type: SubmissionStatus;
    message: string;
  }): Promise<NotificationDoc> {
    const doc = await Notification.create(data);
    return doc.toObject() as unknown as NotificationDoc;
  },

  /**
   * Batch insert notifications efficiently.
   */
  async insertMany(
    notifications: Array<{
      submissionId: string;
      recipientEmail: string;
      type: SubmissionStatus;
      message: string;
    }>
  ): Promise<number> {
    if (notifications.length === 0) return 0;

    // Insert in batches of 1000 to avoid overwhelming MongoDB
    const BATCH_SIZE = 1000;
    let inserted = 0;

    for (let i = 0; i < notifications.length; i += BATCH_SIZE) {
      const batch = notifications.slice(i, i + BATCH_SIZE);
      const result = await Notification.insertMany(batch, { ordered: false });
      inserted += result.length;
    }

    return inserted;
  },

  async findPaginated(
    pagination: PaginationInput
  ): Promise<PaginatedResult<NotificationDoc>> {
    const skip = (pagination.page - 1) * pagination.limit;

    const [data, total] = await Promise.all([
      Notification.find()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(pagination.limit)
        .lean(),
      Notification.countDocuments(),
    ]);

    return {
      data: data as unknown as NotificationDoc[],
      pagination: {
        page: pagination.page,
        limit: pagination.limit,
        total,
        totalPages: Math.ceil(total / pagination.limit),
      },
    };
  },
};
