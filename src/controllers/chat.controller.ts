import { Request, Response } from "express";
import { ChatService } from "../services/chat.service";
import { ApiResponse, ChatCompletionRequest, StreamResponse } from "../types";

export class ChatController {
  private chatService: ChatService;

  constructor() {
    this.chatService = new ChatService();
  }

  async completion(req: Request, res: Response<any>) {
    try {
      const request: any = req.body;
      if (request.stream) {
        await this.chatService.streamChat(request, res);
        return;
      }
      const response = await this.chatService.chat(request);
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
}
