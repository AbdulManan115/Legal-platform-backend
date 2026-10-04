import fs from "node:fs/promises";
import path from "node:path";
import { AdvocateProfile } from "../models/AdvocateProfile";
import { Case } from "../models/Case";
import { CaseDocument } from "../models/CaseDocument";
import { AppError } from "../utils/AppError";
import type { UploadDocumentInput } from "../validators/case-document.validators";

const getAdvocate = async (userId: string) => {
  const advocate = await AdvocateProfile.findOne({
    user: userId,
  }).select("_id");

  if (!advocate) {
    throw new AppError(404, "Advocate profile not found");
  }

  return advocate;
};

const getOwnedCase = async (
  advocateId: string,
  caseId: string,
) => {
  const legalCase = await Case.findOne({
    _id: caseId,
    advocate: advocateId,
  }).select("_id");

  if (!legalCase) {
    throw new AppError(404, "Case not found");
  }

  return legalCase;
};

export const createDocument = async (
  userId: string,
  input: UploadDocumentInput,
  file: Express.Multer.File,
) => {
  const advocate = await getAdvocate(userId);

  await getOwnedCase(
    advocate._id.toString(),
    input.caseId,
  );

  return CaseDocument.create({
    case: input.caseId,
    advocate: advocate._id,
    category: input.category,
    originalName: file.originalname,
    mimeType: file.mimetype,
    sizeBytes: file.size,
    storageKey: file.filename,
    uploadedBy: userId,
  });
};

export const getCaseDocuments = async (
  userId: string,
  caseId: string,
) => {
  const advocate = await getAdvocate(userId);

  await getOwnedCase(
    advocate._id.toString(),
    caseId,
  );

  return CaseDocument.find({
    case: caseId,
    advocate: advocate._id,
  })
    .sort({ createdAt: -1 })
    .lean();
};

export const getDocument = async (
  userId: string,
  documentId: string,
) => {
  const advocate = await getAdvocate(userId);

  const document = await CaseDocument.findOne({
    _id: documentId,
    advocate: advocate._id,
  });

  if (!document) {
    throw new AppError(404, "Document not found");
  }

  return document;
};

export const deleteDocument = async (
  userId: string,
  documentId: string,
) => {
  const document = await getDocument(
    userId,
    documentId,
  );

  const filePath = path.join(
    process.cwd(),
    "uploads",
    document.storageKey,
  );

  await CaseDocument.deleteOne({
    _id: document._id,
  });

  await fs.unlink(filePath).catch(() => undefined);

  return document;
};
