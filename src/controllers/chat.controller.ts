import { Request, Response } from "express";
import { ChatService } from "../services/chat.service";
import { ApiResponse } from "../types";
import { BaseController } from "../app/BaseController";

export class ChatController extends BaseController {
  private chatService: ChatService;

  constructor() {
    super();
    this.chatService = new ChatService();
  }
  async getMessages(req: Request, res: Response<any>) {
    this.handleRequest(req, res, async () => {
      const { body } = req;
      const response = await this.chatService.getMessages(body);
      return this.handleResponse("Product generate successfully", response);
    });
  }

  async completion(req: Request, res: Response<any>) {
    try {
      const request: any = req.body;
      await this.chatService.streamChat(request, res);
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      };
      res.status(500).json(response);
    }
  }
}
