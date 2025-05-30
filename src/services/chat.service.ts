import { ChatOpenAI } from "@langchain/openai";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { RunnableSequence } from "@langchain/core/runnables";
import { config } from "../config/env.config";
import { handleStream } from "../utils";
import { MemoryService } from "./memory.service";
import { tool } from "@langchain/core/tools";
import { z } from "zod";

interface ChatRequest {
  sessionId: string;
  input: string;
}

interface StreamChunk {
  type: string;
  content: string;
  tools: any[];
}

export class ChatService {
  private static readonly CHAT_PROMPT = `You are an AI assistant,
    previous conversation: {history}
    Query: {input}`;

  private model: ChatOpenAI;
  private memoryService: MemoryService;

  constructor() {
    this.model = new ChatOpenAI({
      openAIApiKey: config.openai.apiKey,
      modelName: config.openai.model,
      temperature: config.openai.temperature,
    });
    this.memoryService = new MemoryService();
  }

  private createChatChain(memory: any, model) {
    const prompt = ChatPromptTemplate.fromTemplate(ChatService.CHAT_PROMPT);
    return RunnableSequence.from([
      {
        input: (initialInput: string) => initialInput,
        memory: () => memory.loadMemoryVariables({}),
      },
      {
        input: (previousInput: any) => previousInput.input,
        history: (previousInput: any) => previousInput.memory.history,
      },
      prompt,
      model,
    ]);
  }

  private async handleChatStream(stream: any, res: any): Promise<string> {
    return handleStream(stream, res, (chunk: StreamChunk) => ({
      type: chunk.type,
      content: chunk.content,
      tools: chunk.tools,
    }));
  }

  async streamChat(req: ChatRequest, res: any) {
    try {
      const multiply = tool(
        ({ a, b }: { a: number; b: number }): number => {
          /**
           * Multiply two numbers.
           */
          console.log("tool called");
          return a * b;
        },
        {
          name: "multiply",
          description: "Multiply two numbers",
          schema: z.object({
            a: z.number(),
            b: z.number(),
          }),
        }
      );

      const llmWithTools = this.model.bindTools([multiply]);

      const memory = this.memoryService.getMemory(req.sessionId);
      const chain = this.createChatChain(memory, llmWithTools);

      const stream = chain.streamEvents(req.input, { version: "v2" });

      const finalOutput = await this.handleChatStream(stream, res);

      await this.memoryService.saveMessage({
        sessionId: req.sessionId,
        input: req.input,
        output: finalOutput,
      });
    } catch (error) {
      console.error("Streaming error:", error);
      throw error;
    }
  }

  async getMessages(req: any, res: any) {
    return this.memoryService.getMessages(req.query.sessionId);
  }
}
