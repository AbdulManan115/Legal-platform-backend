import type { Request, Response } from "express";
import path from "node:path";
import { AppError } from "../utils/AppError";
import {
  documentCaseIdSchema,
  documentIdSchema,
  uploadDocumentSchema,
} from "../validators/case-document.validators";
import {
  createDocument,
  deleteDocument,
  getCaseDocuments,
  getDocument,
} from "../services/case-document.service";

interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    role: "client" | "advocate" | "admin";
  };
}

const getUserId = (req: AuthenticatedRequest): string => {
  if (!req.user) {
    throw new AppError(401, "Authentication required");
  }

  return req.user.userId;
};

const upload = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  if (!req.file) {
    throw new AppError(400, "Document file is required");
  }

  const result = uploadDocumentSchema.safeParse({
    caseId: req.body.caseId,
    category: req.body.category || "other",
  });

  if (!result.success) {
    throw new AppError(
      400,
      "Validation failed",
      result.error.issues,
    );
  }

  const document = await createDocument(
    getUserId(req),
    result.data,
    req.file,
  );

  res.status(201).json({
    success: true,
    message: "Document uploaded successfully",
    data: { document },
  });
};

const caseMine = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  const result = documentCaseIdSchema.safeParse(req.params);

  if (!result.success) {
    throw new AppError(400, "Invalid case ID");
  }

  const documents = await getCaseDocuments(
    getUserId(req),
    result.data.caseId,
  );

  res.status(200).json({
    success: true,
    data: { documents },
  });
};

const download = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  const result = documentIdSchema.safeParse(req.params);

  if (!result.success) {
    throw new AppError(400, "Invalid document ID");
  }

  const document = await getDocument(
    getUserId(req),
    result.data.documentId,
  );

  const filePath = path.join(
    process.cwd(),
    "uploads",
    document.storageKey,
  );

  res.download(
    filePath,
    document.originalName,
    (error) => {
      if (error && !res.headersSent) {
        res.status(404).json({
          success: false,
          message: "File not found",
        });
      }
    },
  );
};

const remove = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  const result = documentIdSchema.safeParse(req.params);

  if (!result.success) {
    throw new AppError(400, "Invalid document ID");
  }

  await deleteDocument(
    getUserId(req),
    result.data.documentId,
  );

  res.status(200).json({
    success: true,
    message: "Document deleted successfully",
  });
};

export {
  upload,
  caseMine,
  download,
  remove,
};
