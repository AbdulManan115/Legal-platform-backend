import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import {
  login,
  register,
  refresh,
  logout,
  me,
  changePassword,
  updateMe,
} from "../controllers/auth.controller";
import { requireAuth } from "../middleware/auth";

const router = Router();

router.post("/register", asyncHandler(register));
router.post("/login", asyncHandler(login));
router.post("/refresh", asyncHandler(refresh));
router.post("/logout", asyncHandler(logout));

router.get("/me", requireAuth, asyncHandler(me));
router.patch("/me", requireAuth, asyncHandler(updateMe));

router.patch(
  "/change-password",
  requireAuth,
  asyncHandler(changePassword),
);

export default router;
