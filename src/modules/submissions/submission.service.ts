import mongoose from "mongoose";
import { submissionRepository } from "./submission.repository.js";
import { notificationService } from "../notifications/notification.service.js";
import {
  type SortOption,
  type BulkAction,
  EXTERNAL_TYPES,
  SUBMISSION_STATUSES,
  BULK_ACTIONS,
} from "./submission.types.js";
import {
  createSubmissionSchema,
  type CreateSubmissionInput,
  type SubmissionFilter,
  type PaginationInput,
} from "./submission.validation.js";
import {
  NotFoundError,
  ConflictError,
  ValidationError,
} from "../../lib/errors.js";

export const submissionService = {
  /**
   * Create a new testimonial submission (public).
   */
  async createSubmission(input: CreateSubmissionInput) {
    // Validate input
    const validated = createSubmissionSchema.parse(input);

    const submission = await submissionRepository.create({
      customer: {
        name: validated.customerName,
        email: validated.customerEmail,
        company: validated.company,
        jobTitle: validated.jobTitle,
      },
      rating: validated.rating,
      testimonial: {
        text: validated.testimonialText,
        type: validated.testimonialType,
        sourceUrl:
          EXTERNAL_TYPES.includes(validated.testimonialType) && validated.sourceUrl
            ? validated.sourceUrl
            : undefined,
      },
    });

    return submission;
  },

  /**
   * Get paginated submissions with filters and sorting.
   */
  async getSubmissions(
    filter: SubmissionFilter,
    sort: SortOption,
    pagination: PaginationInput
  ) {
    return submissionRepository.findPaginated(filter, sort, pagination);
  },

  /**
   * Get a single submission by ID.
   */
  async getSubmissionById(id: string) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new NotFoundError("Submission");
    }

    const submission = await submissionRepository.findById(id);
    if (!submission) {
      throw new NotFoundError("Submission");
    }

    return submission;
  },

  /**
   * Approve or reject a single submission.
   * Uses a transaction to ensure both state update and notification are created atomically.
   */
  async reviewSubmission(
    id: string,
    action: BulkAction,
    reviewerEmail: string
  ) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new NotFoundError("Submission");
    }

    const newStatus = action === BULK_ACTIONS.APPROVE ? SUBMISSION_STATUSES.APPROVED : SUBMISSION_STATUSES.REJECTED;

    // Check the current state first for a better error message
    const current = await submissionRepository.findById(id);
    if (!current) {
      throw new NotFoundError("Submission");
    }

    if (current.status !== SUBMISSION_STATUSES.PENDING) {
      throw new ConflictError(
        `Submission is already ${current.status.toLowerCase()}. Only PENDING submissions can be ${newStatus.toLowerCase()}.`
      );
    }

    const session = await mongoose.startSession();
    try {
      session.startTransaction();

      const updated = await submissionRepository.updateStatus(
        id,
        newStatus,
        reviewerEmail
      );

      if (!updated) {
        throw new ConflictError("Submission was modified by another reviewer");
      }

      await notificationService.createForTransition(
        id,
        current.customer.email,
        newStatus
      );

      await session.commitTransaction();

      return updated;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  },

  /**
   * Bulk approve or reject submissions matching a filter.
   * Supports two modes:
   * 1. Filter mode: apply action to all records matching the filter
   * 2. IDs mode: apply action to specific record IDs
   */
  async bulkReviewSubmissions(
    action: BulkAction,
    reviewerEmail: string,
    options: { filter?: SubmissionFilter; ids?: string[] }
  ) {
    const newStatus = action === BULK_ACTIONS.APPROVE ? SUBMISSION_STATUSES.APPROVED : SUBMISSION_STATUSES.REJECTED;

    if (options.ids && options.ids.length > 0) {
      // IDs mode: validate IDs, then update each
      const validIds = options.ids.filter((id) =>
        mongoose.Types.ObjectId.isValid(id)
      );

      if (validIds.length === 0) {
        throw new ValidationError("No valid submission IDs provided");
      }

      // Use filter-based bulk with an $in clause
      const result = await submissionRepository.bulkUpdateStatus(
        { status: SUBMISSION_STATUSES.PENDING } as SubmissionFilter,
        newStatus,
        reviewerEmail
      );

      // Override: use the specific IDs approach
      const { Submission } = await import("./submission.model.js");

      // Find eligible records among the provided IDs
      const eligible = await Submission.find({
        _id: { $in: validIds },
        status: SUBMISSION_STATUSES.PENDING,
      })
        .select({ _id: 1, "customer.email": 1 })
        .lean();

      if (eligible.length === 0) {
        return { affectedCount: 0, notificationCount: 0 };
      }

      const eligibleIds = eligible.map((s) => s._id);

      // Bulk update
      const updateResult = await Submission.updateMany(
        { _id: { $in: eligibleIds }, status: SUBMISSION_STATUSES.PENDING },
        {
          status: newStatus,
          reviewedBy: reviewerEmail,
          reviewedAt: new Date(),
        }
      );

      // Create notifications
      const affectedSubmissions = eligible.map((s) => ({
        _id: String(s._id),
        email: s.customer.email,
      }));

      const notificationCount =
        await notificationService.createBulkForTransition(
          affectedSubmissions,
          newStatus
        );

      return {
        affectedCount: updateResult.modifiedCount,
        notificationCount,
      };
    }

    if (options.filter) {
      // Filter mode: apply to all matching records
      const result = await submissionRepository.bulkUpdateStatus(
        options.filter,
        newStatus,
        reviewerEmail
      );

      if (result.modifiedCount === 0) {
        return { affectedCount: 0, notificationCount: 0 };
      }

      // Create notifications for all affected records
      const notificationCount =
        await notificationService.createBulkForTransition(
          result.affectedSubmissions,
          newStatus
        );

      return {
        affectedCount: result.modifiedCount,
        notificationCount,
      };
    }

    throw new ValidationError(
      "Either 'filter' or 'ids' must be provided for bulk action"
    );
  },

  /**
   * Get approved testimonials only (for viewer).
   */
  async getApprovedTestimonials(
    filter: SubmissionFilter,
    sort: SortOption,
    pagination: PaginationInput
  ) {
    // Force status to APPROVED — viewer can never see other statuses
    const viewerFilter: SubmissionFilter = {
      ...filter,
      status: SUBMISSION_STATUSES.APPROVED,
    };

    return submissionRepository.findPaginated(viewerFilter, sort, pagination);
  },

  /**
   * Count submissions matching a filter.
   */
  async countByFilter(filter: SubmissionFilter) {
    return submissionRepository.countByFilter(filter);
  },
};
