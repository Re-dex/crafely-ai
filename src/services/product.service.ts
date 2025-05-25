import { ChatOpenAI, DallEAPIWrapper } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";
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
      const productPromptTemplate =
        PromptTemplate.fromTemplate(`You are a helpful e-commerce product specialist. Generate detailed product information based on the given input.

      Available Categories and Tags:
      {context}

      Input Request: {prompt}

      Instructions:
      1. Use ONLY the categories and tags provided in the context
      2. Generate a product that matches the input requirements
      3. Ensure the generated product details are consistent with available categories/tags
      4. Keep descriptions professional and market-appropriate
      5. Include all required schema fields
      6. Maintain specified price and SKU if provided

      Remember:
      - Select categories and tags only from the provided context
      - Ensure all specifications are realistic and market-accurate
      - Keep product details aligned with the selected categories
      - Include variations when applicable to the product type

      Generate the product information in a structured format.`);
      const formattedPrompt = await productPromptTemplate.format({
        context: req.context,
        prompt: req.prompt,
      });
      const schema = this.model.withStructuredOutput(productSchema);
      return await schema.invoke(formattedPrompt);
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
