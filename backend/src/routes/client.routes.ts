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
} from "../controllers/client.controller";

const router = Router();

router.use(requireAuth, requireRole("advocate"));

router.post("/", asyncHandler(create));
router.get("/mine", asyncHandler(mine));
router.get("/:clientId", asyncHandler(getOne));
router.patch("/:clientId", asyncHandler(update));
router.delete("/:clientId", asyncHandler(remove));

export default router;
