import { Request, Response } from "express";
import { OpenAiService } from "../services/openai.service";
import { ApiResponse } from "../types";
import path from "path";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { CharacterTextSplitter } from "@langchain/textsplitters";

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
