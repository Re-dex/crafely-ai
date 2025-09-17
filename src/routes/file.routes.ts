import { Router } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import fileController from "../controllers/file.controller";
import { FileValidator } from "../validator/file.validator";

const uploadDir = path.resolve(process.cwd(), "tmp", "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, unique + "-" + file.originalname);
  },
});

const upload = multer({
  storage,
  fileFilter: (_req, file, cb) => {
    if (file.mimetype !== "application/pdf") {
      return cb(new Error("Only PDF files are allowed"));
    }
    cb(null, true);
  },
  limits: { fileSize: 20 * 1024 * 1024 },
});

const router = Router();

// File upload endpoint
router.post(
  "/upload",
  upload.single("file"),
  FileValidator.upload,
  fileController.upload
);

// File query endpoint
router.post("/query", FileValidator.query, fileController.query);

// File chat endpoint
router.post("/chat", FileValidator.chat, fileController.chat);

export default router;
