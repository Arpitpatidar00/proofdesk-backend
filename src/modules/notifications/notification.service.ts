import { notificationRepository } from "./notification.repository.js";
import { SUBMISSION_STATUSES, type SubmissionStatus } from "../submissions/submission.types.js";

export const notificationService = {
  /**
   * Create a single notification for a state transition.
   */
  async createForTransition(
    submissionId: string,
    recipientEmail: string,
    action: SubmissionStatus
  ) {
    const message =
      action === SUBMISSION_STATUSES.APPROVED
        ? `Your testimonial has been approved. Thank you for your feedback!`
        : `Your testimonial has been reviewed and was not approved at this time.`;

    return notificationRepository.create({
      submissionId,
      recipientEmail,
      type: action,
      message,
    });
  },

  /**
   * Create notifications in bulk for a batch of state transitions.
   */
  async createBulkForTransition(
    submissions: Array<{ _id: string; email: string }>,
    action: SubmissionStatus
  ): Promise<number> {
    const message =
      action === SUBMISSION_STATUSES.APPROVED
        ? `Your testimonial has been approved. Thank you for your feedback!`
        : `Your testimonial has been reviewed and was not approved at this time.`;

    const notifications = submissions.map((sub) => ({
      submissionId: sub._id,
      recipientEmail: sub.email,
      type: action,
      message,
    }));

    return notificationRepository.insertMany(notifications);
  },

  /**
   * Get paginated notifications.
   */
  async getNotifications(pagination: { page: number; limit: number }) {
    return notificationRepository.findPaginated(pagination);
  },
};
