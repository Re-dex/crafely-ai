import { Request, Response } from "express";
import { ChatService } from "../services/chat.service";
import { ApiResponse } from "../types";

export class ChatController {
  private chatService: ChatService;

  constructor() {
    this.chatService = new ChatService();
  }
  async getMessages(req: Request, res: Response<any>) {
    try {
      const request: any = req.body;
      const response = await this.chatService.getMessages(request, res);
      res.json({
        success: true,
        data: response,
      });
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      };
      res.status(500).json(response);
    }
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
