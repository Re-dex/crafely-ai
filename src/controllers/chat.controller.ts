import { Request, Response } from "express";
import { ChatService } from "../services/chat.service";
import { ApiResponse } from "../types";
import { BaseController } from "../app/BaseController";
import { UsageService } from "../services/usage.service";

export class ChatController extends BaseController {
  private chatService: ChatService;
  private usageService: UsageService;

  constructor() {
    super();
    this.chatService = new ChatService();
    this.usageService = new UsageService();
  }
  async getMessages(req: Request, res: Response<any>) {
    this.handleRequest(req, res, async () => {
      const { query } = req;
      const response = await this.chatService.getMessages(query.sessionId);
      return this.handleResponse("Messages fetched successfully", response);
    });
  }

  async completion(req: any, res: Response<any>) {
    try {
      await this.chatService.streamChat(req.body, res);
      if (req.apiKey) {
        await this.usageService.create({
          apiKeyId: req.apiKey.id,
          userId: req.user?.id,
          provider: "openai",
          model: req.body?.model || undefined,
          type: "chat",
          metadata: { sessionId: req.body?.sessionId },
        });
      }
    } catch (error: any) {
      console.error("Streaming error:", error);
      res.status(500).json({
        message: "Streaming error",
        error: error.message || error,
      });
    }
  }

  async parseCompletion(req: Request, res: Response<any>) {
    this.handleRequest(req, res, async () => {
      const request: any = req.body;
      const response = await this.chatService.parseCompletion(request);
      return this.handleResponse("Completion parsed successfully", response);
    });
  }
}
