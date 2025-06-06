import { Request, Response } from "express";
import { OpenAiService } from "../services/openai.service";
import { ApiResponse } from "../types";
import { handleStream } from "../utils";
import path from "path";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { CharacterTextSplitter } from "@langchain/textsplitters";
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
      const pdfPath = path.join(__dirname, "../../public/2.pdf");

      const loader = new PDFLoader(pdfPath, {
        splitPages: false,
      });
      const pages = await loader.load();
      // console.log(pages);
      const textSplitter = new CharacterTextSplitter({
        chunkSize: 30,
        chunkOverlap: 20,
      });
      const texts = await textSplitter.splitText(pages[0].pageContent);
      res.json({
        success: true,
        data: texts,
      });
    } catch (error) {
      console.error("Streaming error:", error);
      throw error;
    }
  }
}
