import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { requireAuth } from "../middleware/auth";
import { requireRole } from "../middleware/roles";
import {
  create,
  clientMine,
  advocateMine,
  confirm,
  reject,
  complete,
  cancel,
} from "../controllers/appointment.controller";

const router = Router();

router.post(
  "/",
  requireAuth,
  requireRole("client"),
  asyncHandler(create),
);

router.get(
  "/client/mine",
  requireAuth,
  requireRole("client"),
  asyncHandler(clientMine),
);

router.get(
  "/advocate/mine",
  requireAuth,
  requireRole("advocate"),
  asyncHandler(advocateMine),
);

router.patch(
  "/:appointmentId/confirm",
  requireAuth,
  requireRole("advocate"),
  asyncHandler(confirm),
);

router.patch(
  "/:appointmentId/reject",
  requireAuth,
  requireRole("advocate"),
  asyncHandler(reject),
);

router.patch(
  "/:appointmentId/complete",
  requireAuth,
  requireRole("advocate"),
  asyncHandler(complete),
);

router.patch(
  "/:appointmentId/cancel",
  requireAuth,
  asyncHandler(cancel),
);

export default router;
