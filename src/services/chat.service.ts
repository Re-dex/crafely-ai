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

  async streamChat(request: ChatCompletionRequest, res: any) {
    try {
      const { messages } = request;
      const stream = await this.model.stream("Tel me about Bangladesh");

      // Set headers for SSE
      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");

      // Stream each chunk to the client
      for await (const chunk of stream) {
        const streamResponse: any = {
          id: Date.now().toString(),
          content: chunk.content || "",
          done: false,
        };
        res.write(`data: ${JSON.stringify(streamResponse)}\n\n`);
      }

      // Send the final chunk to indicate completion
      const finalResponse: StreamResponse = {
        id: Date.now().toString(),
        content: "",
        done: true,
      };
      res.write(`data: ${JSON.stringify(finalResponse)}\n\n`);
      res.end();
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
