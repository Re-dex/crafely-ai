import { ChatOpenAI } from "@langchain/openai";
import { convertToLangChainMessages } from "../utils";
import { trimMessages } from "@langchain/core/messages";
import {
  ToolMessage,
  SystemMessage,
  AIMessage,
  HumanMessage,
  BaseMessage,
} from "@langchain/core/messages";
import { config } from "../config/env.config";
import { handleStream } from "../utils";
import { MemoryService } from "./memory.service";
import { toolWrapper } from "../tools/wrapper.tools";
import { z } from "zod";

const ResponseFormatter = z.object({
  presentation_title: z.string().describe("The title of the presentation"),
  slides: z
    .array(
      z.object({
        title: z.string().describe("The title of the slide"),
        content: z.string().describe("The content/body of the slide"),
        recommendation: z
          .string()
          .describe(
            "A recommendation for the slide, AI will provide recommendation how slide may be improved"
          ),
      })
    )
    .describe("The slides of the presentation, each with a title and content"),
});

// Add type definition for the response
type ResponseFormatterType = z.infer<typeof ResponseFormatter>;

interface ChatRequest {
  sessionId: string;
  prompt: string | any[];
  instructions: string;
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
      let previous_messages = [];
      const llmWithTools = this.model.bindTools(toolWrapper(req.tools_schema));
      const trimmer = trimMessages({
        maxTokens: ChatService.MAX_TOKENS,
        strategy: "last",
        tokenCounter: this.model,
        includeSystem: true,
      });
      if (req.sessionId) {
        previous_messages = await this.memoryService.getContext(req.sessionId);
      }

      if (req.tools?.length > 0) {
        previous_messages.push(
          // @ts-ignore
          new AIMessage({ content: "", additional_kwargs: req.signatures })
        );
        previous_messages.push(...this.processToolOutput(req?.tools));
      } else {
        if (req.instructions) {
          const system_message = new SystemMessage(req.instructions);
          previous_messages.push(system_message);
        }
        const prompt = convertToLangChainMessages(req.prompt);
        previous_messages = [...previous_messages, ...prompt];
      }
      const trimmedHistory = await trimmer.invoke(previous_messages);
      const stream = llmWithTools.streamEvents(trimmedHistory, {
        version: "v2",
      });

      const finalOutput = await this.handleChatStream(stream, res);
      if (req.sessionId) {
        await this.memoryService.saveMessage({
          sessionId: req.sessionId,
          input: req.prompt,
          output: finalOutput,
        });
      }
    } catch (error) {
      console.error("Streaming error:", error);
      throw error;
    }
  }

  async getMessages(sessionId: any) {
    return this.memoryService.getMessages(sessionId);
  }

  async parseCompletion(request: any) {
    const { sessionId, prompt } = request;
    try {
      const modelWithStructure = this.model.withStructuredOutput(
        ResponseFormatter as any
      ) as ChatOpenAI;
      const response = await modelWithStructure.invoke(prompt);
      return response;
    } catch (error) {
      console.error('Error in parseCompletion:', error);
      throw error;
    }
  }
}
