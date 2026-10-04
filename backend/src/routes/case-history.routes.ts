import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { requireAuth } from "../middleware/auth";
import { requireRole } from "../middleware/roles";
import {
  create,
  mine,
} from "../controllers/case-history.controller";

const router = Router();

router.use(requireAuth, requireRole("advocate"));

router.post("/", asyncHandler(create));
router.get("/:caseId", asyncHandler(mine));

export default router;
