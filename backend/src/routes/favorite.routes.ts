import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { requireAuth } from "../middleware/auth";
import { requireRole } from "../middleware/roles";
import {
  save,
  remove,
  list,
} from "../controllers/favorite.controller";

const router = Router();

router.use(requireAuth, requireRole("client"));

router.get("/", asyncHandler(list));
router.post("/:advocateId", asyncHandler(save));
router.delete("/:advocateId", asyncHandler(remove));

export default router;
