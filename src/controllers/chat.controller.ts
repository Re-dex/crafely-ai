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
      const { query } = req;
      const response = await this.chatService.getMessages(query.sessionId);
      return this.handleResponse("Messages fetched successfully", response);
    });
  }

  async completion(req: Request, res: Response<any>) {
    this.handleRequest(req, res, async () => {
      const request: any = req.body;
      await this.chatService.streamChat(request, res);
    });
  }

  async parseCompletion(req: Request, res: Response<any>) {
    this.handleRequest(req, res, async () => {
      const request: any = req.body;
      const response = await this.chatService.parseCompletion(request);
      return this.handleResponse("Completion parsed successfully", response);
    });
  }
}
