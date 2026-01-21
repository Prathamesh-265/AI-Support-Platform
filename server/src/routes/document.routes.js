import { Router } from "express";
import { requireAuth, requireAdmin } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/upload.middleware.js";
import { validateFileUpload } from "../middlewares/validate.middleware.js";
import {
  deleteDocument,
  listDocuments,
  uploadDocument,
} from "../controllers/document.controller.js";

const router = Router();

// Admin only
router.get("/", requireAuth, requireAdmin, listDocuments);

router.post(
  "/upload",
  requireAuth,
  requireAdmin,
  upload.single("file"),
  validateFileUpload,
  uploadDocument
);

router.delete("/:id", requireAuth, requireAdmin, deleteDocument);

export default router;
