import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { requireAuth } from "../middleware/auth";
import { requireRole } from "../middleware/roles";
import {
  create,
  mine,
  getOne,
  update,
  remove,
} from "../controllers/case.controller";

const router = Router();

router.use(requireAuth, requireRole("advocate"));

router.post("/", asyncHandler(create));
router.get("/mine", asyncHandler(mine));
router.get("/:caseId", asyncHandler(getOne));
router.patch("/:caseId", asyncHandler(update));
router.delete("/:caseId", asyncHandler(remove));

export default router;
