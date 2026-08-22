import { Submission } from "./submission.model.js";
import type { SortOption, BaseSubmission, SubmissionStatus } from "./submission.types.js";
import { SUBMISSION_STATUSES } from "./submission.types.js";
import type { SubmissionFilter, PaginationInput } from "./submission.validation.js";
import { SORT_OPTIONS } from "./submission.types.js";
import { buildSubmissionQuery } from "../../lib/query-builder.js";
import type { SortOrder } from "mongoose";

export interface SubmissionDoc extends BaseSubmission<Date> {
  _id: string;
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const submissionRepository = {
  async create(data: {
    customer: { name: string; email: string; company: string; jobTitle: string };
    rating: number;
    testimonial: { text: string; type: string; sourceUrl?: string };
  }): Promise<SubmissionDoc> {
    const doc = await Submission.create({
      ...data,
      status: SUBMISSION_STATUSES.PENDING,
    });
    return doc.toObject() as unknown as SubmissionDoc;
  },

  async findById(id: string): Promise<SubmissionDoc | null> {
    const doc = await Submission.findById(id).lean();
    return doc as unknown as SubmissionDoc | null;
  },

  async findPaginated(
    filter: SubmissionFilter,
    sort: SortOption,
    pagination: PaginationInput
  ): Promise<PaginatedResult<SubmissionDoc>> {
    const query = buildSubmissionQuery(filter);
    const sortObj = SORT_OPTIONS[sort] as Record<string, SortOrder>;
    const skip = (pagination.page - 1) * pagination.limit;

    const [data, total] = await Promise.all([
      Submission.find(query)
        .sort(sortObj)
        .skip(skip)
        .limit(pagination.limit)
        .lean(),
      Submission.countDocuments(query),
    ]);

    return {
      data: data as unknown as SubmissionDoc[],
      pagination: {
        page: pagination.page,
        limit: pagination.limit,
        total,
        totalPages: Math.ceil(total / pagination.limit),
      },
    };
  },

  /**
   * Update a single submission's status with state transition guard.
   * Only transitions from PENDING are allowed.
   */
  async updateStatus(
    id: string,
    newStatus: SubmissionStatus,
    reviewedBy: string
  ): Promise<SubmissionDoc | null> {
    const doc = await Submission.findOneAndUpdate(
      { _id: id, status: SUBMISSION_STATUSES.PENDING },
      {
        status: newStatus,
        reviewedBy,
        reviewedAt: new Date(),
      },
      { new: true }
    ).lean();
    return doc as unknown as SubmissionDoc | null;
  },

  /**
   * Bulk update status using filter + state transition guard.
   * Returns the IDs and emails of affected records for notification creation.
   */
  async bulkUpdateStatus(
    filter: SubmissionFilter,
    newStatus: SubmissionStatus,
    reviewedBy: string
  ): Promise<{
    modifiedCount: number;
    affectedSubmissions: Array<{ _id: string; email: string }>;
  }> {
    const query = buildSubmissionQuery(filter);
    // Always enforce state transition: only update PENDING records
    query.status = SUBMISSION_STATUSES.PENDING;

    // First, find the eligible records (only _id and email for notifications)
    const eligible = await Submission.find(query)
      .select({ _id: 1, "customer.email": 1 })
      .lean();

    if (eligible.length === 0) {
      return { modifiedCount: 0, affectedSubmissions: [] };
    }

    const eligibleIds = eligible.map((s) => s._id);

    // Bulk update using the IDs we just found
    const result = await Submission.updateMany(
      { _id: { $in: eligibleIds }, status: SUBMISSION_STATUSES.PENDING },
      {
        status: newStatus,
        reviewedBy,
        reviewedAt: new Date(),
      }
    );

    const affectedSubmissions = eligible.map((s) => ({
      _id: String(s._id),
      email: (s as any).customer?.email || "",
    }));

    return {
      modifiedCount: result.modifiedCount,
      affectedSubmissions,
    };
  },

  /**
   * Count matching records for a filter (used for "Select all matching" UI).
   */
  async countByFilter(filter: SubmissionFilter): Promise<number> {
    const query = buildSubmissionQuery(filter);
    return Submission.countDocuments(query);
  },
};
