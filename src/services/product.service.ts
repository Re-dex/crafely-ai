import { ChatOpenAI, DallEAPIWrapper } from "@langchain/openai";
import { DuckDuckGoSearch } from "@langchain/community/tools/duckduckgo_search";
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
      // const tool = new DuckDuckGoSearch({ maxResults: 1 });
      // const searchResult = await tool.invoke(req.prompt);
      // console.log(searchResult);
      const schema = this.model.withStructuredOutput(productSchema);
      return await schema.invoke(req.prompt);
    } catch (error) {
      console.error("Generation error:", error);
      throw error;
    }
  }
  async generateImage(req: any) {
    try {
      const tool = new DallEAPIWrapper({
        n: 1, // Default
        model: "dall-e-3", // Default
        apiKey: config.openai.apiKey,
        style: "natural",
      });
      return await tool.invoke(req.prompt);
    } catch (error) {
      console.error("Generation error:", error);
      throw error;
    }
  }
}
