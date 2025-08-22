import { Request, Response } from "express";
import { ChatService } from "../services/chat.service";
import { config } from "../config/env.config";
import { BaseController } from "../app/BaseController";
import { UsageService } from "../services/usage.service";
import { TokenPriceCalculatorService } from "../services/tokenPrice.service";

export class ChatController extends BaseController {
  private chatService: ChatService;
  private usageService: UsageService;
  private tokenPriceCalculatorService: TokenPriceCalculatorService;
  constructor() {
    super();
    this.chatService = new ChatService();
    this.usageService = new UsageService();
    this.tokenPriceCalculatorService = new TokenPriceCalculatorService();
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
      const { input_tokens, output_tokens } = response.usage_metadata;
      const { inputCost, outputCost } =
        this.tokenPriceCalculatorService.calculate({
          model: config.openai.model,
          inputTokens: input_tokens,
          outputTokens: output_tokens,
        });
      if (req.apiKey) {
        await this.usageService.create({
          apiKeyId: req.apiKey.id,
          userId: req.user?.id,
          provider: "openai",
          tokensIn: input_tokens,
          tokensOut: output_tokens,
          tokensTotal: response.usage_metadata.total_tokens,
          model: config.openai.model || undefined,
          cost: inputCost + outputCost,
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
