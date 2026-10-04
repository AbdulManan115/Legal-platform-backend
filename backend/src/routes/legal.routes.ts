import { Router } from "express";
import {
  categoryProvisions,
  checkIssue,
  listCategories,
} from "../controllers/legal.controller";

const router = Router();

router.post("/check", checkIssue);
router.get("/categories", listCategories);
router.get("/categories/:slug/provisions", categoryProvisions);

export default router;
