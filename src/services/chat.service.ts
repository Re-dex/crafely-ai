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
import { toolWrapper } from "../tools/wrapper.tools";

interface ChatRequest {
  sessionId: string;
  prompt: string;
  tools: [];
  tools_schema?: any[];
  signature: any;
}

interface StreamChunk {
  type: string;
  content: string;
  tool_call: any;
}

export class ChatService {
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

  private async handleChatStream(stream: any, res: any): Promise<string> {
    return handleStream(stream, res, (chunk: StreamChunk) => ({
      type: chunk.type,
      content: chunk.content,
      tool_call: chunk.tool_call,
    }));
  }

  async streamChat(req: ChatRequest, res: any) {
    try {
      const llmWithTools = this.model.bindTools(toolWrapper(req.tools_schema));
      const trimmer = trimMessages({
        maxTokens: ChatService.MAX_TOKENS,
        strategy: "last",
        tokenCounter: this.model,
        includeSystem: true,
      });
      const previous_messages = await this.memoryService.getContext(
        req.sessionId
      );
      if (req.tools?.length > 0) {
        previous_messages.push(
          // @ts-ignore
          new AIMessage({ additional_kwargs: req.signatures })
        );
        previous_messages.push(...this.processToolOutput(req?.tools));
      } else {
        const user_message = new HumanMessage(req.prompt);
        previous_messages.push(user_message);
      }
      // const trimmedHistory = await trimmer.invoke(previous_messages);
      // console.log(trimmedHistory);
      const stream = llmWithTools.streamEvents(previous_messages, {
        version: "v2",
      });

      const finalOutput = await this.handleChatStream(stream, res);
      await this.memoryService.saveMessage({
        sessionId: req.sessionId,
        input: req.prompt,
        output: finalOutput,
      });
    } catch (error) {
      console.error("Streaming error:", error);
      throw error;
    }
  }

  async getMessages(sessionId: any) {
    return this.memoryService.getMessages(sessionId);
  }
}
