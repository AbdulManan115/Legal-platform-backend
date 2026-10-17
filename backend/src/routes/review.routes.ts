import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { requireAuth } from "../middleware/auth";
import { requireRole } from "../middleware/roles";
import {
  create,
  advocateReviews,
  appointmentReview,
} from "../controllers/review.controller";

const router = Router();

router.post(
  "/",
  requireAuth,
  requireRole("client"),
  asyncHandler(create),
);

router.get(
  "/appointment/:appointmentId",
  requireAuth,
  requireRole("client"),
  asyncHandler(appointmentReview),
);

router.get(
  "/advocate/:advocateId",
  asyncHandler(advocateReviews),
);

export default router;
