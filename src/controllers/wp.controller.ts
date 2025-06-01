import { Request, Response } from "express";
import { OpenAiService } from "../services/openai.service";
import { ApiResponse } from "../types";
import { handleStream } from "../utils";
import { HumanMessage, AIMessage, ToolMessage } from "@langchain/core/messages";
import { tool } from "@langchain/core/tools";
import { z } from "zod";
import {
  ChatPromptTemplate,
  HumanMessagePromptTemplate,
  SystemMessagePromptTemplate,
} from "@langchain/core/prompts";
import { RunnableSequence } from "@langchain/core/runnables";
export class WPController {
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
  async generateAltText(req: Request, res: Response<any>) {
    try {
      const request: any = req.body;
      const response = await this.openaiService.vision(
        request.url,
        request.prompt
      );
      res.json({
        success: true,
        data: response.choices[0].message.content,
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

  async tesMethod(req: any, res: any) {
    try {
      const multiply = tool(
        ({ a, b }: { a: number; b: number }): number => {
          /**
           * Multiply two numbers.
           */
          console.log("tool called");
          return a * b;
        },
        {
          name: "multiply",
          description: "Multiply two numbers",
          schema: z.object({
            a: z.number(),
            b: z.number(),
          }),
        }
      );
      const { type, product } = req.body;
      const model = this.openaiService.getModel();
      const llmWithTools = model.bindTools([multiply]);
      const messages = [new HumanMessage("What is 3 * 12?")];
      const result = await llmWithTools.invoke(messages);
      messages.push(result);
      const toolOutput = await multiply.invoke(result.tool_calls[0]);
      messages.push(toolOutput);
      const finalResult = await llmWithTools.invoke(messages);
      console.log(finalResult.content);
      res.json({
        success: true,
        data: finalResult.content,
      });
    } catch (error) {
      console.error("Streaming error:", error);
      throw error;
    }
  }
}
