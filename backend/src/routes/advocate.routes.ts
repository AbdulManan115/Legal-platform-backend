import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { requireAuth } from "../middleware/auth";
import { requireRole } from "../middleware/roles";
import {
  createProfile,
  getMyProfile,
  updateMyProfile,
  updateAvailability,
} from "../controllers/advocate.controller";

const router = Router();

router.use(requireAuth, requireRole("advocate"));

router.post("/profile", asyncHandler(createProfile));
router.get("/profile/me", asyncHandler(getMyProfile));
router.patch("/profile/me", asyncHandler(updateMyProfile));
router.patch("/availability", asyncHandler(updateAvailability));

export default router;
