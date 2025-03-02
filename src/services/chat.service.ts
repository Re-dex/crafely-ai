import { ChatOpenAI } from "@langchain/openai";
import { config } from "../config/env.config";
import { ChatCompletionRequest, StreamResponse } from "../types";
import { z } from "zod";

export class ChatService {
  private model: ChatOpenAI;

  constructor() {
    this.model = new ChatOpenAI({
      openAIApiKey: config.openai.apiKey,
      modelName: config.openai.model,
      temperature: config.openai.temperature,
      streaming: true,
    });
  }

  async streamChat(request: ChatCompletionRequest) {
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
    // const stream = await this.model.stream(
    //   messages.map((msg) => ({
    //     role: msg.role,
    //     content: msg.content,
    //   }))
    // );

    return "stream";
  }

  async chat(request: ChatCompletionRequest) {
    const { messages } = request;

    console.log(this.model);

    // const response = await this.model.complete(
    //   messages.map((msg) => ({
    //     role: msg.role,
    //     content: msg.content,
    //   }))
    // );

    return "response";
  }
}
