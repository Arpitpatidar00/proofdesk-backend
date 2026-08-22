import { z } from "zod";
import {
  SUBMISSION_STATUSES,
  TESTIMONIAL_TYPES,
  BULK_ACTIONS,
  SORT_OPTIONS,
  EXTERNAL_TYPES,
} from "./submission.types.js";
import type { SortOption } from "./submission.types.js";

export const createSubmissionSchema = z
  .object({
    customerName: z.string().trim().min(1, "Name is required").max(200),
    customerEmail: z.string().trim().email("Invalid email address").max(320),
    company: z.string().trim().min(1, "Company is required").max(200),
    jobTitle: z.string().trim().min(1, "Job title is required").max(200),
    rating: z.number().int().min(1, "Rating must be 1–5").max(5, "Rating must be 1–5"),
    testimonialText: z
      .string()
      .trim()
      .min(10, "Testimonial must be at least 10 characters")
      .max(5000, "Testimonial must be under 5000 characters"),
    testimonialType: z.nativeEnum(TESTIMONIAL_TYPES),
    sourceUrl: z
      .string()
      .trim()
      .url("Must be a valid URL")
      .max(2048)
      .optional()
      .or(z.literal("")),
  })
  .refine(
    (data) => {
      if (EXTERNAL_TYPES.includes(data.testimonialType)) {
        return !!data.sourceUrl && data.sourceUrl !== "";
      }
      return true;
    },
    {
      message: "Source URL is required for VIDEO, SOCIAL, and REVIEW types",
      path: ["sourceUrl"],
    }
  );

export type CreateSubmissionInput = z.infer<typeof createSubmissionSchema>;

export const submissionFilterSchema = z.object({
  search: z.string().trim().max(500).optional(),
  status: z.nativeEnum(SUBMISSION_STATUSES).optional(),
  type: z.nativeEnum(TESTIMONIAL_TYPES).optional(),
  ratingMin: z.coerce.number().int().min(1).max(5).optional(),
  ratingMax: z.coerce.number().int().min(1).max(5).optional(),
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
});

export type SubmissionFilter = z.infer<typeof submissionFilterSchema>;

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(50),
});

export type PaginationInput = z.infer<typeof paginationSchema>;

export const sortSchema = z.object({
  sort: z
    .enum(Object.keys(SORT_OPTIONS) as [SortOption, ...SortOption[]])
    .default("newest"),
});

export type SortInput = z.infer<typeof sortSchema>;

export const singleActionSchema = z.object({
  action: z.nativeEnum(BULK_ACTIONS),
});

export type SingleActionInput = z.infer<typeof singleActionSchema>;

export const bulkActionSchema = z.object({
  action: z.nativeEnum(BULK_ACTIONS),
  ids: z.array(z.string()).optional(),
  filter: submissionFilterSchema.optional(),
});

export type BulkActionInput = z.infer<typeof bulkActionSchema>;
