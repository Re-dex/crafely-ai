import { ChatOpenAI } from "@langchain/openai";
import { config } from "../config/env.config";
import { handleStream, convertToLangChainMessages } from "../utils";
import { productSchema } from "./productSchema";
import { z } from "zod";

export class ProductService {
  private model: ChatOpenAI;

  constructor() {
    this.model = new ChatOpenAI({
      openAIApiKey: config.openai.apiKey,
      modelName: config.openai.model,
      temperature: config.openai.temperature,
    });
  }

  async conversation(req: any, res: any) {
    try {
      const messages = convertToLangChainMessages(req.additional_messages);
      const stream = await this.model.stream(messages);
      await handleStream(stream, res, (chunk) => {
        return { content: chunk.content };
      });
    } catch (error) {
      console.error("Streaming error:", error);
      throw error;
    }
  }

  async generate(req: any) {
    try {
      const joke = z.object({
        setup: z.string().describe("The setup of the joke"),
        punchline: z.string().describe("The punchline to the joke"),
        rating: z
          .number()
          .optional()
          .describe("How funny the joke is, from 1 to 10"),
      });
      const messages = convertToLangChainMessages(req.additional_messages);
      const schema = this.model.withStructuredOutput(productSchema);
      const response = await schema.invoke(messages);
      return response;
    } catch (error) {
      console.error("Generation error:", error);
      throw error;
    }
  }
}
