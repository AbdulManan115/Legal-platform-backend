import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { getSlots } from "../controllers/slot.controller";

const router = Router();

router.get(
  "/:advocateId",
  asyncHandler(getSlots),
);

export default router;
