import { Request, Response } from "express";
import { RagService } from "../services/rag.service";

export class RagController {
  private rag: RagService;
  constructor(ragService = new RagService()) {
    this.rag = ragService;
  }

  upload = async (req: any, res: Response) => {
    try {
      const userId = req?.user?.id;
      if (!userId) {
        res.status(401).json({ success: false, message: "Unauthorized" });
        return;
      }

      const file = req.file as Express.Multer.File;
      if (!file) {
        res.status(400).json({ success: false, message: "No file uploaded" });
        return;
      }

      const doc = await this.rag.createDocument({
        userId,
        threadId: req.body?.threadId || req.query?.threadId,
        filePath: file.path,
        filename: file.originalname,
        mimeType: file.mimetype,
        title: file.originalname,
      });

      res.status(201).json({ success: true, document: doc });
    } catch (error: any) {
      res
        .status(500)
        .json({ success: false, message: error?.message || "Upload failed" });
    }
  };

  query = async (req: any, res: Response) => {
    try {
      const userId = req?.user?.id;
      if (!userId) {
        res.status(401).json({ success: false, message: "Unauthorized" });
        return;
      }
      const { query, topK, threadId } = req.body || {};
      if (!query) {
        res.status(400).json({ success: false, message: "query is required" });
        return;
      }

      const results = await this.rag.query({ userId, threadId, query, topK });
      res.status(200).json({ success: true, results });
    } catch (error: any) {
      res
        .status(500)
        .json({ success: false, message: error?.message || "Query failed" });
    }
  };
}

export default new RagController();
