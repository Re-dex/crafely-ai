import { ChatOpenAI } from "@langchain/openai";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { RunnableSequence } from "@langchain/core/runnables";
import { trimMessages } from "@langchain/core/messages";
import {
  ToolMessage,
  SystemMessage,
  AIMessage,
  HumanMessage,
} from "@langchain/core/messages";
import { config } from "../config/env.config";
import { handleStream } from "../utils";
import { MemoryService } from "./memory.service";
import { tool } from "@langchain/core/tools";
import { z } from "zod";

interface ChatRequest {
  sessionId: string;
  input: string;
  tools: [];
  signature: any;
}

interface StreamChunk {
  type: string;
  content: string;
  tool_call: any;
}

export class ChatService {
  private static readonly CHAT_PROMPT = `You are an AI assistant,
    previous conversation: {history}
    Query: {input}`;
  private static readonly MAX_TOKENS = 1000;
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

  private processToolOutput = (tool_outputs = []) => {
    return tool_outputs.map((item) => new ToolMessage(item));
  };

  private createChatChain(memory: any, model, tool_outputs) {
    const prompt = ChatPromptTemplate.fromTemplate(ChatService.CHAT_PROMPT);
    const trimmer = trimMessages({
      maxTokens: ChatService.MAX_TOKENS,
      strategy: "last",
      tokenCounter: this.model,
      includeSystem: true,
    });
    return RunnableSequence.from([
      {
        input: (initialInput: string) => initialInput,
        memory: () => memory.loadMemoryVariables({}),
      },
      {
        input: (previousInput: any) => previousInput.input,
        history: async (previousInput: any) => {
          const history = previousInput.memory.history;
          // console.log(history);
          // Add tool outputs if they exist
          if (tool_outputs.length > 0) {
            history.push(...tool_outputs);
          }

          // Trim the messages
          const trimmedHistory = await trimmer.invoke(history);
          return history;
        },
      },
      prompt,
      model,
    ]);
  }

  private async handleChatStream(stream: any, res: any): Promise<string> {
    return handleStream(stream, res, (chunk: StreamChunk) => ({
      type: chunk.type,
      content: chunk.content,
      tool_call: chunk.tool_call,
    }));
  }

  async streamChat(req: ChatRequest, res: any) {
    try {
      const multiply = tool(
        ({ a, b }: { a: number; b: number }): number => {
          /**
           * Multiply two numbers.
           */
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

      const previous_messages = await this.memoryService.getContext(
        req.sessionId
      );
      if (req.tools?.length > 0) {
        previous_messages.push(
          // @ts-ignore
          new AIMessage({ additional_kwargs: req.signatures })
        );
        previous_messages.push(...this.processToolOutput(req.tools));
      } else {
        const user_message = new HumanMessage(req.input);
        previous_messages.push(user_message);
      }

      const stream = llmWithTools.streamEvents(previous_messages, {
        version: "v2",
      });

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
