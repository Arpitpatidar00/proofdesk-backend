import type { FilterQuery } from "mongoose";
import type { ISubmission } from "../modules/submissions/submission.model.js";
import type { SubmissionFilter } from "../modules/submissions/submission.validation.js";

/**
 * Builds a safe MongoDB filter from a validated SubmissionFilter.
 * This is the SINGLE controlled location for query construction.
 */
export function buildSubmissionQuery(
  filter: SubmissionFilter
): FilterQuery<ISubmission> {
  const query: FilterQuery<ISubmission> = {};

  if (filter.status) {
    query.status = filter.status;
  }

  if (filter.type) {
    query["testimonial.type"] = filter.type;
  }

  if (filter.ratingMin !== undefined || filter.ratingMax !== undefined) {
    query.rating = {};
    if (filter.ratingMin !== undefined) {
      query.rating.$gte = filter.ratingMin;
    }
    if (filter.ratingMax !== undefined) {
      query.rating.$lte = filter.ratingMax;
    }
  }

  if (filter.from || filter.to) {
    query.createdAt = {};
    if (filter.from) {
      query.createdAt.$gte = filter.from;
    }
    if (filter.to) {
      // Include the entire "to" day
      const toEnd = new Date(filter.to);
      toEnd.setHours(23, 59, 59, 999);
      query.createdAt.$lte = toEnd;
    }
  }

  if (filter.search && filter.search.trim()) {
    query.$text = { $search: filter.search.trim() };
  }

  return query;
}
