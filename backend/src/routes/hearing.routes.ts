import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { requireAuth } from "../middleware/auth";
import { requireRole } from "../middleware/roles";
import {
  create,
  caseMine,
  upcoming,
  update,
  remove,
} from "../controllers/hearing.controller";

const router = Router();

router.use(requireAuth, requireRole("advocate"));

router.post("/", asyncHandler(create));
router.get("/upcoming", asyncHandler(upcoming));
router.get("/case/:caseId", asyncHandler(caseMine));
router.patch("/:hearingId", asyncHandler(update));
router.delete("/:hearingId", asyncHandler(remove));

export default router;
