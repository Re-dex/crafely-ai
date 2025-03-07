import { Request, Response } from "express";
import { OpenAiService } from "../services/openai.service";
import { ApiResponse, ChatCompletionRequest, StreamResponse } from "../types";

export class TagsController {
  private openaiService: OpenAiService;

  constructor() {
    this.openaiService = new OpenAiService();
  }

  async generateTags(req: Request, res: Response<any>) {
    try {
      const request: any = req.body;
      const { tags } = await this.openaiService.structureOutput(request, res);
      res.json({
        success: true,
        data: tags,
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
