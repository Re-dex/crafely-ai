import { Router } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import ragController from "../controllers/rag.controller";

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

router.post("/upload", upload.single("file"), ragController.upload);
router.post("/query", ragController.query);
router.post("/chat", ragController.chat);

export default router;
