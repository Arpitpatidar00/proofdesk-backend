import type {
  SubmissionStatus,
  TestimonialType,
  BulkAction,
  SortOption,
  BaseSubmission,
} from "../modules/submissions/submission.types.js";
import type { SubmissionFilter } from "../modules/submissions/submission.validation.js";

// Re-export specific enums/types from submission schemas
export type { SubmissionStatus, TestimonialType, BulkAction, SortOption, SubmissionFilter, BaseSubmission };
export { SUBMISSION_STATUSES, TESTIMONIAL_TYPES, BULK_ACTIONS, SORT_OPTIONS } from "../modules/submissions/submission.types.js";

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  pagination?: PaginationInfo;
  error?: {
    code: string;
    message: string;
    details?: Record<string, string[]>;
  };
}

export interface BulkActionResult {
  affectedCount: number;
  notificationCount: number;
}

export interface SubmissionDTO extends BaseSubmission<string> {
  _id: string;
}

// ─── Selection Model ───────────────────────────────────

export type Selection =
  | { mode: "NONE" }
  | { mode: "VISIBLE"; ids: string[] }
  | { mode: "FILTER"; filter: SubmissionFilter; totalMatching: number };

// ─── User Types ────────────────────────────────────────

export { USER_ROLES } from "../modules/auth/auth.middleware.js";
export type { UserRole, AuthUser as User } from "../modules/auth/auth.middleware.js";
