import { ChatPromptTemplate } from "@langchain/core/prompts";
import { ChatOpenAI, OpenAIClient } from "@langchain/openai";
import OpenAI from "openai";
import fs from "fs";
import { config } from "../config/env.config";
import { z } from "zod";

export class OpenAiService {
  private model: ChatOpenAI;
  private tagExtractorPrompt: ChatPromptTemplate;
  private tagsSchema: any;
  private openai: any;
  private sdk: OpenAI;

  constructor() {
    this.openai = new OpenAIClient({
      apiKey: config.openai.apiKey,
    });
    this.sdk = new OpenAI({ apiKey: config.openai.apiKey });
    this.model = new ChatOpenAI({
      openAIApiKey: config.openai.apiKey,
      modelName: config.openai.model,
      temperature: config.openai.temperature,
    });

    this.tagsSchema = z.object({
      tags: z
        .array(z.string())
        .describe("Array of relevant tags extracted from the blog post"),
    });

    this.tagExtractorPrompt = ChatPromptTemplate.fromMessages([
      [
        "system",
        "You are a precise tag extractor. Extract relevant tags from the blog post content. Focus on key topics, technologies, concepts, and themes. Return only the most relevant tags.",
      ],
      [
        "user",
        "Context: {context}\nContent: {content}\nExtract relevant tags from this blog post.",
      ],
    ]);
  }

  async structureOutput(req: any, res: any) {
    try {
      const schema = this.model.withStructuredOutput(this.tagsSchema, {
        name: "extract_tags",
        strict: true,
      });

      const formattedPrompt = await this.tagExtractorPrompt.format({
        context: req.context || "Blog post tag extraction",
        content: req.prompt,
      });

      return await schema.invoke(formattedPrompt);
    } catch (error) {
      console.error("Streaming error:", error);
      throw error;
    }
  }

  getModel() {
    return this.model;
  }
}
