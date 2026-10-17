import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { requireAuth } from "../middleware/auth";
import { requireRole } from "../middleware/roles";
import {
  create,
  mine,
  remove,
  update,
} from "../controllers/case-history.controller";

const router = Router();

router.use(requireAuth, requireRole("advocate"));

router.post("/", asyncHandler(create));
router.patch("/:historyId", asyncHandler(update));
router.delete("/:historyId", asyncHandler(remove));
router.get("/:caseId", asyncHandler(mine));

export default router;
