import { Router } from "express";
import multer from "multer";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { asyncHandler } from "../utils/asyncHandler";
import { requireAuth } from "../middleware/auth";
import { requireRole } from "../middleware/roles";
import {
  upload,
  caseMine,
  download,
  remove,
} from "../controllers/case-document.controller";

const router = Router();

const allowedTypes = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, path.join(process.cwd(), "uploads"));
  },

  filename: (_req, file, cb) => {
    const extension = path.extname(file.originalname).toLowerCase();
    cb(null, `${randomUUID()}${extension}`);
  },
});

const uploadMiddleware = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024,
  },

  fileFilter: (_req, file, cb) => {
    if (!allowedTypes.has(file.mimetype)) {
      cb(
        new Error(
          "Only PDF, JPG, PNG and DOCX files are allowed",
        ),
      );
      return;
    }

    cb(null, true);
  },
});

router.use(requireAuth, requireRole("advocate"));

router.post(
  "/upload",
  uploadMiddleware.single("document"),
  asyncHandler(upload),
);

router.get(
  "/case/:caseId",
  asyncHandler(caseMine),
);

router.get(
  "/:documentId/download",
  asyncHandler(download),
);

router.delete(
  "/:documentId",
  asyncHandler(remove),
);

export default router;
