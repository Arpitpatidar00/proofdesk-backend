import type { Request, Response, NextFunction } from "express";
import { sendResponse } from "../../lib/response.js";
import { submissionService } from "./submission.service.js";
import { USER_ROLES, SUBMISSION_STATUSES } from "../../types/api.js";
import { ForbiddenError } from "../../lib/errors.js";
import {
  createSubmissionSchema,
  submissionFilterSchema,
  paginationSchema,
  sortSchema,
  singleActionSchema,
  bulkActionSchema,
} from "./submission.validation.js";

export const submissionController = {
  /**
   * POST /api/submissions — Public
   */
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const input = createSubmissionSchema.parse(req.body);
      const submission = await submissionService.createSubmission(input);

      sendResponse(res, {
        statusCode: 201,
        data: submission,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/submissions — Reviewer
   */
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const filter = submissionFilterSchema.parse(req.query);
      const pagination = paginationSchema.parse(req.query);
      const { sort } = sortSchema.parse(req.query);

      const result = await submissionService.getSubmissions(
        filter,
        sort,
        pagination,
      );

      sendResponse(res, {
        data: result.data,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/submissions/:id — Reviewer
   */
  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const submission = await submissionService.getSubmissionById(id);

      // Viewers can only see APPROVED submissions
      if (
        req.user?.role === USER_ROLES.VIEWER &&
        submission.status !== SUBMISSION_STATUSES.APPROVED
      ) {
        throw new ForbiddenError("You can only view approved submissions");
      }

      sendResponse(res, {
        data: submission,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * PATCH /api/submissions/:id/action — Reviewer only
   */
  async action(req: Request, res: Response, next: NextFunction) {
    try {
      const { action } = singleActionSchema.parse(req.body);
      const id = req.params.id as string;
      const updated = await submissionService.reviewSubmission(
        id,
        action,
        req.user!.email,
      );

      sendResponse(res, {
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /api/submissions/bulk-action — Reviewer only
   */
  async bulkAction(req: Request, res: Response, next: NextFunction) {
    try {
      const { action, filter, ids } = bulkActionSchema.parse(req.body);

      const result = await submissionService.bulkReviewSubmissions(
        action,
        req.user!.email,
        { filter, ids },
      );

      sendResponse(res, {
        data: {
          affectedCount: result.affectedCount,
          notificationCount: result.notificationCount,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/testimonials — Viewer (approved only)
   */
  async testimonials(req: Request, res: Response, next: NextFunction) {
    try {
      const filter = submissionFilterSchema.parse(req.query);
      const pagination = paginationSchema.parse(req.query);
      const { sort } = sortSchema.parse(req.query);

      const result = await submissionService.getApprovedTestimonials(
        filter,
        sort,
        pagination,
      );

      sendResponse(res, {
        data: result.data,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/submissions/count — Count matching filter
   */
  async count(req: Request, res: Response, next: NextFunction) {
    try {
      const filter = submissionFilterSchema.parse(req.query);
      const total = await submissionService.countByFilter(filter);

      sendResponse(res, {
        data: { total },
      });
    } catch (error) {
      next(error);
    }
  },
};
