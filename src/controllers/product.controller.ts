import { Request, Response } from "express";
import { ProductService } from "../services/product.service";
import { OpenAiService } from "../services/openai.service";
import { BaseController } from "../app/BaseController";
import { handleStream } from "../utils";
import {
  ChatPromptTemplate,
  HumanMessagePromptTemplate,
  SystemMessagePromptTemplate,
} from "@langchain/core/prompts";
import { RunnableSequence } from "@langchain/core/runnables";
export class ProductController extends BaseController {
  private productService: ProductService;
  private openaiService: OpenAiService;

  constructor() {
    super();
    this.productService = new ProductService();
    this.openaiService = new OpenAiService();
  }

  async generate(req: Request, res: Response<any>) {
    this.handleRequest(req, res, async () => {
      const { body } = req;
      const { product } = await this.productService.generate(body);
      return this.handleResponse("Product generate successfully", product);
    });
  }

  async generateDescription(req: any, res: any) {
    this.handleRequest(req, res, async () => {
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

      const stream = chain.streamEvents(
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
    });
  }

  async generateImage(req: Request, res: Response<any>) {
    this.handleRequest(req, res, async () => {
      const { body } = req;
      const response = await this.productService.generateImage(body);
      return this.handleResponse("Image generate successfully", response);
    });
  }
}
