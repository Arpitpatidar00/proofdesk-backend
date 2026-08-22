import { Router } from "express";
import { notificationService } from "./notification.service.js";
import { requireRole, USER_ROLES } from "../auth/auth.middleware.js";
import { paginationSchema } from "../submissions/submission.validation.js";
import { sendResponse } from "../../lib/response.js";
import type { NextFunction, Request, Response } from "express";

const router = Router();

router.get(
  "/notifications",
  requireRole(USER_ROLES.REVIEWER),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const pagination = paginationSchema.parse(req.query);
      const result = await notificationService.getNotifications(pagination);

      sendResponse(res, {
        message: "Notifications fetched successfully",
        data: result.data,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
