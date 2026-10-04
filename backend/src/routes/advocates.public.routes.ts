import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { search } from "../controllers/advocate-search.controller";
import { getPublicProfile } from "../controllers/advocate-public.controller";
import { getRecommendations } from "../controllers/recommendation.controller";

const router = Router();

router.get("/", asyncHandler(search));
router.get("/recommended", asyncHandler(getRecommendations));
router.get("/:slug", asyncHandler(getPublicProfile));

export default router;
