import { ChatOpenAI } from "@langchain/openai";
import {
  HumanMessage,
  SystemMessage,
  AIMessage,
} from "@langchain/core/messages";
import { config } from "../config/env.config";
import { ChatCompletionRequest, ChatMessage } from "../types";
import { z } from "zod";
import { handleStream, convertToLangChainMessages } from "../utils";

export class ChatService {
  private model: ChatOpenAI;

  constructor() {
    this.model = new ChatOpenAI({
      openAIApiKey: config.openai.apiKey,
      modelName: config.openai.model,
      temperature: config.openai.temperature,
    });
  }

  async streamChat(req: any, res: any) {
    try {
      const messages = convertToLangChainMessages(req.messages);
      const stream = await this.model.stream(messages);
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
