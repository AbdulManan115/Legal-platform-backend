import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { requireAuth } from "../middleware/auth";
import { requireRole } from "../middleware/roles";
import {
  create,
  mine,
  clientMine,
  clientGetOne,
  forClient,
  getOne,
  update,
  remove,
} from "../controllers/case.controller";

const router = Router();

router.get(
  "/client/mine",
  requireAuth,
  requireRole("client"),
  asyncHandler(clientMine),
);


router.get(
  "/client/:caseId",
  requireAuth,
  requireRole("client"),
  asyncHandler(clientGetOne),
);

router.use(requireAuth, requireRole("advocate"));

router.post("/", asyncHandler(create));
router.get("/mine", asyncHandler(mine));
router.get("/for-client/:clientId", asyncHandler(forClient));
router.get("/:caseId", asyncHandler(getOne));
router.patch("/:caseId", asyncHandler(update));
router.delete("/:caseId", asyncHandler(remove));

export default router;
