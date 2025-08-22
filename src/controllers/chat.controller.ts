import { Request, Response } from "express";
import { ChatService } from "../services/chat.service";
import { config } from "../config/env.config";
import { BaseController } from "../app/BaseController";
import { UsageService } from "../services/usage.service";
import { UsageRecorderService } from "../services/usageRecorder.service";

export class ChatController extends BaseController {
  private chatService: ChatService;
  private usageService: UsageService;
  private usageRecorder: UsageRecorderService;
  constructor() {
    super();
    this.chatService = new ChatService();
    this.usageService = new UsageService();
    this.usageRecorder = new UsageRecorderService(this.usageService);
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
      const response = await this.chatService.streamChat(req.body, res);
      await this.usageRecorder.recordFromRequest(req, response.usage_metadata, {
        model: config.openai.model,
      });
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
