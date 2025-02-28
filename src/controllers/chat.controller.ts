import { Request, Response } from 'express';
import { ChatService } from '../services/chat.service';
import { ApiResponse, ChatCompletionRequest, StreamResponse } from '../types';

export class ChatController {
  private chatService: ChatService;

  constructor() {
    this.chatService = new ChatService();
  }

  async streamCompletion(req: Request, res: Response) {
    try {
      const request: ChatCompletionRequest = req.body;
      const stream = await this.chatService.streamChat(request);

      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      for await (const chunk of stream) {
        const streamResponse: StreamResponse = {
          id: Date.now().toString(),
          content: chunk.content,
          done: false
        };
        res.write(`data: ${JSON.stringify(streamResponse)}\n\n`);
      }

      const finalResponse: StreamResponse = {
        id: Date.now().toString(),
        content: '',
        done: true
      };
      res.write(`data: ${JSON.stringify(finalResponse)}\n\n`);
      res.end();
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
      res.status(500).json(response);
    }
  }

  async completion(req: Request, res: Response) {
    try {
      const request: ChatCompletionRequest = req.body;
      const response = await this.chatService.chat(request);

      const apiResponse: ApiResponse = {
        success: true,
        data: response
      };
      res.json(apiResponse);
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
      res.status(500).json(response);
    }
  }
}