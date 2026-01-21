import fs from "fs";
import path from "path";
import { Document } from "../models/Document.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { extractTextFromFile } from "../services/ingest.service.js";
import { VALIDATION_LIMITS, ERROR_MESSAGES } from "../constants/index.js";

export const uploadDocument = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res
      .status(400)
      .json(new ApiResponse(false, ERROR_MESSAGES.INVALID_INPUT));
  }

  const filePath = req.file.path;
  const fileName = req.file.originalname;

  let extractedText = "";
  try {
    extractedText = await extractTextFromFile(filePath);
  } catch (err) {
    console.error("❌ File extraction error:", err?.message || err);

    try {
      fs.unlinkSync(filePath);
    } catch {}

    return res
      .status(400)
      .json(new ApiResponse(false, "Failed to extract text from file"));
  }

  const doc = await Document.create({
    fileName,
    filePath, // keep as-is (works in local). On Render storage resets anyway.
    extractedText,
    uploadedBy: req.user.id,
  });

  return res
    .status(201)
    .json(new ApiResponse(true, "Document uploaded successfully", doc));
});

export const listDocuments = asyncHandler(async (req, res) => {
  const docs = await Document.find().sort({ createdAt: -1 });

  return res.status(200).json(
    new ApiResponse(true, "Documents retrieved", {
      count: docs.length,
      documents: docs,
    })
  );
});

export const deleteDocument = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res
      .status(400)
      .json(new ApiResponse(false, "Document ID is required"));
  }

  const doc = await Document.findByIdAndDelete(id);
  if (!doc) {
    return res
      .status(404)
      .json(new ApiResponse(false, ERROR_MESSAGES.NOT_FOUND));
  }

  
  if (doc.filePath) {
    const resolvedPath = path.resolve(doc.filePath);
    fs.unlink(resolvedPath, () => {});
  }

  return res
    .status(200)
    .json(new ApiResponse(true, "Document deleted successfully"));
});

export const getKnowledgeContext = async () => {
  const docs = await Document.find().sort({ createdAt: -1 }).limit(10);

  const combined = docs
    .map(
      (d) =>
        `Document: ${d.fileName}\n${(d.extractedText || "").slice(
          0,
          VALIDATION_LIMITS.MAX_DOCUMENT_TEXT_LENGTH
        )}`
    )
    .join("\n\n---\n\n");

  return combined.slice(0, VALIDATION_LIMITS.MAX_KNOWLEDGE_CONTEXT);
};
