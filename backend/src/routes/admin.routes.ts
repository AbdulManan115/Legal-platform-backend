import { Router } from "express";

import {
  dashboardStats,
  users,
  changeUserStatus,
  changeUserRole,
  pendingAdvocates,
  verifyAdvocate,
  moderationReviews,
  moderateReview,
  legalCategories,
  createCategory,
  editCategory,
  removeCategory,
  legalProvisions,
  createProvision,
  editProvision,
  removeProvision,
} from "../controllers/admin.controller";

import { requireAuth } from "../middleware/auth";

const router = Router();

router.use(requireAuth);

router.get("/dashboard", dashboardStats);

router.get("/users", users);
router.patch("/users/:userId/status", changeUserStatus);
router.patch("/users/:userId/role", changeUserRole);

router.get("/advocates/pending", pendingAdvocates);
router.patch("/advocates/:advocateId/verification", verifyAdvocate);

router.get("/reviews", moderationReviews);
router.patch("/reviews/:reviewId/moderation", moderateReview);

router.get("/legal/categories", legalCategories);
router.post("/legal/categories", createCategory);
router.patch("/legal/categories/:categoryId", editCategory);
router.delete("/legal/categories/:categoryId", removeCategory);

router.get("/legal/provisions", legalProvisions);
router.post("/legal/provisions", createProvision);
router.patch("/legal/provisions/:provisionId", editProvision);
router.delete("/legal/provisions/:provisionId", removeProvision);

export default router;
