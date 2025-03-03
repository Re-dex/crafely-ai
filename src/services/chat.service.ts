import { ChatOpenAI } from "@langchain/openai";
import { config } from "../config/env.config";
import { ChatCompletionRequest } from "../types";
import { z } from "zod";
import { handleStream } from "../utils";
export class ChatService {
  private model: ChatOpenAI;

  constructor() {
    this.model = new ChatOpenAI({
      openAIApiKey: config.openai.apiKey,
      modelName: config.openai.model,
      temperature: config.openai.temperature,
    });
  }

  async streamChat(request: ChatCompletionRequest, res: any) {
    try {
      const { messages } = request;
      const stream = await this.model.stream(
        "Tell me about Bangladesh history"
      );
      await handleStream(stream, res, (chunk) => {
        return { content: chunk.content };
      });
    } catch (error) {
      console.error("Streaming error:", error);
      throw error;
    }
  }

  async chat(request: ChatCompletionRequest) {
    const { messages } = request;
    const joke = z.object({
      setup: z.string().describe("The setup of the joke"),
      punchline: z.string().describe("The punchline to the joke"),
      rating: z
        .number()
        .optional()
        .describe("How funny the joke is, from 1 to 10"),
    });

    const structuredLlm = this.model.withStructuredOutput(joke);

    return await structuredLlm.invoke("Tell me a joke about cats");
  }
}
