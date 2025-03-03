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
      const request: ChatCompletionRequest = req.body;
      console.log("request", request);
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
