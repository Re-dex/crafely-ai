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
import { FileSearchToolService } from "./fileSearchTool.service";
import { z } from "zod";

const ResponseFormatter = z.object({
  presentation_title: z.string().describe("The title of the presentation"),
  slides: z
    .array(
      z.object({
        order: z.number().describe("Order/position of slide in presentation"),
        type: z
          .enum(["cover", "table_of_contents", "content", "conclusion"])
          .describe("Type of slide"),
        layout: z
          .enum([
            "leftTextRightVisual",
            "centered",
            "rightTextLeftVisual",
            "topTextBottomVisual",
            "bottomTextTopVisual",
          ])
          .describe("Layout of the slide"),
        title: z.string().describe("The title of the slide"),
        outline: z
          .string()
          .describe(
            "A complete and detailed outline of the slide, including all text, structure, and key points that should appear. This should provide enough information to fully generate the slide content without requiring extra context."
          ),
        imageDescription: z
          .string()
          .describe(
            "A detailed description of the image for the slide. Include subject, style, background, colors, and any other important details so that the image can be generated accurately."
          ),
      })
    )
    .describe("The slides of the presentation, each with a title and content"),
});

// Formatter for the new presentation endpoint
const PresentationResponseFormatter = z.object({
  title: z
    .string()
    .max(255)
    .describe("A concise title of the presentation (max 255 characters)"),
  description: z
    .string()
    .describe(
      "A very elaborated description of the presentation, comprehensive and detailed"
    ),
  globalStyle: z
    .object({
      accentColor: z
        .string()
        .describe("Accent color for highlights, e.g., #FF5733 or 'teal'"),
      backgroundColor: z
        .string()
        .describe("Background color for slides, e.g., #FFFFFF or 'black'"),
      backgroundImage: z
        .string()
        .describe("Background image reference or description (URL or text)"),
      fontFamily: z
        .string()
        .describe("Font family to use across slides, e.g., 'Inter'"),
    })
    .strict()
    .describe(
      "Global style for the presentation. Must include all of: accentColor, backgroundColor, backgroundImage, fontFamily"
    ),
});

// Add type definition for the response
type ResponseFormatterType = z.infer<typeof ResponseFormatter>;

interface ChatRequest {
  threadId: string;
  input: string | any[];
  instructions: string;
  tools: [];
  tools_schema?: any[];
  signature: any;
  userId?: string; // Required for fileSearch tool
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
  private fileSearchToolService: FileSearchToolService;

  constructor() {
    this.model = new ChatOpenAI({
      openAIApiKey: config.openai.apiKey,
      modelName: config.openai.model,
      temperature: config.openai.temperature,
    });
    this.memoryService = new MemoryService();
    this.fileSearchToolService = new FileSearchToolService();
  }

  private processToolOutput = (tool_outputs = []) => {
    return tool_outputs.map((item) => new ToolMessage(item));
  };

  private async handleChatStream(
    stream: any,
    res: any
  ): Promise<{ content: string; usage_metadata: any }> {
    return handleStream(stream, res, (chunk: StreamChunk) => ({
      type: chunk.type,
      content: chunk.content,
      tool_call: chunk.tool_call,
    }));
  }

  async streamChat(req: ChatRequest, res: any) {
    try {
      let previous_messages = [];

      // Merge fileSearch tool with client tools
      const allTools = [
        this.fileSearchToolService.getToolSchema(),
        ...toolWrapper(req.tools_schema),
      ];

      const llmWithTools = this.model.bindTools(allTools);
      const trimmer = trimMessages({
        maxTokens: ChatService.MAX_TOKENS,
        strategy: "last",
        tokenCounter: this.model,
        includeSystem: true,
      });
      if (req.threadId) {
        previous_messages = await this.memoryService.getContext(req.threadId);
      }

      if (req.tools?.length > 0) {
        previous_messages.push(
          // @ts-ignore
          new AIMessage({ content: "", additional_kwargs: req.signatures })
        );
        previous_messages.push(...this.processToolOutput(req?.tools));
      } else {
        // Add fileSearch tool instructions to system prompt
        const fileSearchInstructions = this.fileSearchToolService
          .getSystemPromptInstructions()
          .join("\n");
        const combinedInstructions = req.instructions
          ? `${req.instructions}\n\n${fileSearchInstructions}`
          : fileSearchInstructions;

        const system_message = new SystemMessage(combinedInstructions);
        previous_messages.push(system_message);

        const input = convertToLangChainMessages(req.input);
        previous_messages = [...previous_messages, ...input];
      }
      const trimmedHistory = await trimmer.invoke(previous_messages);
      const stream = llmWithTools.streamEvents(trimmedHistory, {
        version: "v2",
      });

      const { content, usage_metadata } = await this.handleChatStream(
        stream,
        res
      );
      if (req.threadId) {
        await this.memoryService.saveMessage({
          sessionId: req.threadId,
          input: req.input,
          output: content,
        });
      }
      return { content, usage_metadata };
    } catch (error) {
      console.error("Streaming error:", error);
      throw error;
    }
  }

  async getMessages(threadId: any) {
    return this.memoryService.getMessages(threadId);
  }

  async parseCompletion(req: any) {
    try {
      let messages = [];
      const input = convertToLangChainMessages(req.input);
      messages = [...messages, ...input];
      if (req.instructions) {
        const system_message = new SystemMessage(req.instructions);
        messages.push(system_message);
      }

      const modelWithStructure = this.model.withStructuredOutput(
        ResponseFormatter as any
      ) as ChatOpenAI;
      return await modelWithStructure.invoke(messages);
    } catch (error) {
      console.error("Error in parseCompletion:", error);
      throw error;
    }
  }

  // New method to create and return a presentation structure
  async parsePresentation(req: any) {
    try {
      let messages: any[] = [];
      const input = convertToLangChainMessages(req.input);
      messages = [...messages, ...input];

      if (req.instructions) {
        const system_message = new SystemMessage(req.instructions);
        messages.push(system_message);
      }

      const modelWithStructure = this.model.withStructuredOutput(
        PresentationResponseFormatter as any
      ) as ChatOpenAI;

      return await modelWithStructure.invoke(messages);
    } catch (error) {
      console.error("Error in parsePresentation:", error);
      throw error;
    }
  }
}
