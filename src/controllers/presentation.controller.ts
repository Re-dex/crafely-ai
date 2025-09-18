import { Request, Response } from "express";
import { ChatService } from "../services/chat.service";
import { config } from "../config/env.config";
import { BaseController } from "../app/BaseController";
import { UsageService } from "../services/usage.service";
import { UsageRecorderService } from "../services/usageRecorder.service";
import { ReplicateService } from "../services/replicate.service";

export class PresentationController extends BaseController {
  private chatService: ChatService;
  private usageService: UsageService;
  private usageRecorder: UsageRecorderService;
  private replicateService: ReplicateService;

  constructor() {
    super();
    this.chatService = new ChatService();
    this.usageService = new UsageService();
    this.usageRecorder = new UsageRecorderService(this.usageService);
    this.replicateService = new ReplicateService();
  }

  /**
   * General completion for presentation context
   * Handles streaming chat responses for presentation-related queries
   */
  async completion(req: any, res: Response<any>) {
    this.handleRequest(req, res, async () => {
      try {
        const chatRequest = {
          ...req.body,
          user: req.user, // Include user from JWT/API key middleware
        };
        const response = await this.chatService.streamChat(chatRequest, res);
        await this.usageRecorder.recordFromRequest(
          req,
          response.usage_metadata,
          {
            model: config.openai.model,
          }
        );
      } catch (error: any) {
        console.error("Presentation streaming error:", error);
        res.status(500).json({
          message: "Presentation streaming error",
          error: error.message || error,
        });
      }
    });
  }

  /**
   * Create a complete presentation
   * Generates structured presentation content from user input
   */
  async createPresentation(req: Request, res: Response<any>) {
    this.handleRequest(req, res, async () => {
      const request: any = req.body;
      const response = await this.chatService.parsePresentation(request);
      return this.handleResponse("Presentation created successfully", response);
    });
  }

  /**
   * Create individual slides
   * Generates slide content with specific formatting
   */
  async createSlide(req: Request, res: Response<any>) {
    this.handleRequest(req, res, async () => {
      const request: any = req.body;
      const response = await this.chatService.parseCompletion(request);
      return this.handleResponse("Slide created successfully", response);
    });
  }

  /**
   * Generate visual content for slides
   * Creates images, diagrams, or visual elements for presentations
   */
  async generateSlideVisual(req: Request, res: Response<any>) {
    this.handleRequest(req, res, async () => {
      const { input, model } = req.body as { input: object; model?: string };
      const result = await this.replicateService.generateImage({
        input,
        model,
      });
      return this.handleResponse("Slide visual generated successfully", result);
    });
  }

  /**
   * Chat functionality specifically for presentation context
   * Alias for completion with presentation-specific error handling
   */
  async chat(req: any, res: Response<any>) {
    this.handleRequest(req, res, async () => {
      try {
        // Pass the full req object to include user information from middleware
        const chatRequest = {
          ...req.body,
          user: req.user, // Include user from JWT/API key middleware
        };
        const response = await this.chatService.streamChat(chatRequest, res);
        await this.usageRecorder.recordFromRequest(
          req,
          response.usage_metadata,
          {
            model: config.openai.model,
          }
        );
      } catch (error: any) {
        console.error("Presentation chat error:", error);
        res.status(500).json({
          message: "Presentation chat error",
          error: error.message || error,
        });
      }
    });
  }

  /**
   * Get presentation-related messages
   * Retrieves chat history for presentation context
   */
  async getMessages(req: Request, res: Response<any>) {
    this.handleRequest(req, res, async () => {
      const { query } = req;
      const response = await this.chatService.getMessages(query.threadId);
      return this.handleResponse(
        "Presentation messages fetched successfully",
        response
      );
    });
  }
}
