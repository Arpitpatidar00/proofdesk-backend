// ─── Enums ─────────────────────────────────────────────

export const SUBMISSION_STATUSES = {
  PENDING: "PENDING",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
} as const;
export type SubmissionStatus = keyof typeof SUBMISSION_STATUSES;

export const TESTIMONIAL_TYPES = {
  WRITTEN: "WRITTEN",
  VIDEO: "VIDEO",
  SOCIAL: "SOCIAL",
  REVIEW: "REVIEW",
} as const;
export type TestimonialType = keyof typeof TESTIMONIAL_TYPES;

export const BULK_ACTIONS = {
  APPROVE: "APPROVE",
  REJECT: "REJECT",
} as const;
export type BulkAction = keyof typeof BULK_ACTIONS;

// Types that require a source URL
export const EXTERNAL_TYPES: TestimonialType[] = [
  TESTIMONIAL_TYPES.VIDEO,
  TESTIMONIAL_TYPES.SOCIAL,
  TESTIMONIAL_TYPES.REVIEW,
];

// ─── Sorting ───────────────────────────────────────────

export const SORT_OPTIONS = {
  newest: { createdAt: -1 },
  oldest: { createdAt: 1 },
  ratingHigh: { rating: -1 },
  ratingLow: { rating: 1 },
} as const;

export type SortOption = keyof typeof SORT_OPTIONS;

// ─── Shared Base Type ───────────────────────────────────

export interface BaseSubmission<TDate = Date> {
  customer: {
    name: string;
    email: string;
    company: string;
    jobTitle: string;
  };
  rating: number;
  testimonial: {
    text: string;
    type: TestimonialType;
    sourceUrl?: string;
  };
  status: SubmissionStatus;
  reviewedBy?: string;
  reviewedAt?: TDate;
  createdAt: TDate;
  updatedAt: TDate;
}
