import { Request, Response } from "express";
import { ProductService } from "../services/product.service";
import { OpenAiService } from "../services/openai.service";

import { ApiResponse } from "../types";
import { handleStream } from "../utils";
import {
  ChatPromptTemplate,
  HumanMessagePromptTemplate,
  SystemMessagePromptTemplate,
} from "@langchain/core/prompts";
import { RunnableSequence } from "@langchain/core/runnables";
export class ProductController {
  private productService: ProductService;
  private openaiService: OpenAiService;

  constructor() {
    this.productService = new ProductService();
    this.openaiService = new OpenAiService();
  }

  async generate(req: Request, res: Response<any>) {
    try {
      const request: any = req.body;
      const { product } = await this.productService.generate(request);
      res.json({
        success: true,
        data: product,
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

  async generateDescription(req: any, res: any) {
    try {
      const { type, product } = req.body;

      const chatPrompt = ChatPromptTemplate.fromMessages([
        SystemMessagePromptTemplate.fromTemplate(
          "You are a helpful assistant for helping user to generate e-commerce product {type} description. The description should be proper HTML formatted key highlighted with bold. Do not use any code block, pre and code tags."
        ),
        HumanMessagePromptTemplate.fromTemplate(
          "Generate {type} description. Based on this product, Name: {name}, Current description: {description}, Current short description: {shortDescription}"
        ),
      ]);

      const chain = RunnableSequence.from([
        chatPrompt,
        this.openaiService.getModel(),
      ]);

      const stream = await chain.streamEvents(
        {
          type: type,
          name: product.name,
          description: product.description,
          shortDescription: product.short_description,
        },
        { version: "v2" }
      );
      await handleStream(stream, res, (chunk) => {
        return {
          type: chunk.type,
          content: chunk.content,
        };
      });
    } catch (error) {
      console.error("Streaming error:", error);
      throw error;
    }
  }

  async generateImage(req: Request, res: Response<any>) {
    try {
      const request: any = req.body;
      const response = await this.productService.generateImage(request);
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
