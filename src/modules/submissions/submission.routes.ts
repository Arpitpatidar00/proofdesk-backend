import { Router } from "express";
import { submissionController } from "./submission.controller.js";
import { requireRole, USER_ROLES } from "../auth/auth.middleware.js";

const router = Router();

// Public — anyone can submit a testimonial
router.post("/submissions", submissionController.create);

// Reviewer — list all submissions with filters
router.get("/submissions", requireRole(USER_ROLES.REVIEWER), submissionController.list);

// Reviewer — count matching submissions
router.get(
  "/submissions/count",
  requireRole(USER_ROLES.REVIEWER),
  submissionController.count,
);

// Viewer & Reviewer — get single submission detail (permissions checked in controller)
router.get(
  "/submissions/:id",
  submissionController.getById,
);

// Reviewer — approve/reject single submission
router.patch(
  "/submissions/:id/action",
  requireRole(USER_ROLES.REVIEWER),
  submissionController.action,
);

// Reviewer — bulk approve/reject
router.post(
  "/submissions/bulk-action",
  requireRole(USER_ROLES.REVIEWER),
  submissionController.bulkAction,
);

// Viewer — approved testimonials only
router.get("/testimonials", submissionController.testimonials);

export default router;
