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
      const schema = this.model.withStructuredOutput(productSchema);
      return await schema.invoke(req.prompt);
    } catch (error) {
      console.error("Generation error:", error);
      throw error;
    }
  }
}
