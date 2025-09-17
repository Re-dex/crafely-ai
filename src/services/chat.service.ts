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
  user?: { id: string }; // User object from JWT middleware
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

  // Server-side tool registry for scalable tool management
  private serverTools: Map<string, any> = new Map();

  constructor() {
    this.model = new ChatOpenAI({
      openAIApiKey: config.openai.apiKey,
      modelName: config.openai.model,
      temperature: config.openai.temperature,
    });
    this.memoryService = new MemoryService();
    this.fileSearchToolService = new FileSearchToolService();

    // Register server-side tools
    this.registerServerTool("fileSearch", this.fileSearchToolService);
  }

  /**
   * Register a server-side tool for scalable tool management
   */
  private registerServerTool(toolName: string, toolService: any) {
    this.serverTools.set(toolName, toolService);
  }

  /**
   * Check if a tool is a server-side tool
   */
  private isServerTool(toolName: string): boolean {
    return this.serverTools.has(toolName);
  }

  /**
   * Execute server-side tools
   */
  private async executeServerTool(
    toolName: string,
    args: any,
    userId: string,
    threadId?: string
  ): Promise<any> {
    const toolService = this.serverTools.get(toolName);
    if (!toolService) {
      throw new Error(`Server tool ${toolName} not found`);
    }

    // Handle fileSearch tool specifically
    if (toolName === "fileSearch") {
      return await toolService.execute(args, userId, threadId);
    }

    // Future server tools can be added here
    throw new Error(`Server tool ${toolName} execution not implemented`);
  }

  private processToolOutput = (tool_outputs = []) => {
    return tool_outputs.map((item) => new ToolMessage(item));
  };

  /**
   * Process tool calls and execute server-side tools
   */
  private async processToolCalls(
    toolCalls: any[],
    userId: string,
    threadId?: string
  ): Promise<{ serverToolResults: any[]; clientToolCalls: any[] }> {
    const serverToolResults: any[] = [];
    const clientToolCalls: any[] = [];

    for (const toolCall of toolCalls) {
      // Handle both OpenAI format (function.name) and LangChain format (name)
      const toolName = toolCall.function?.name || toolCall.name;

      if (
        (toolCall.type === "function" || toolCall.type === "tool_call") &&
        toolName
      ) {
        if (this.isServerTool(toolName)) {
          // Execute server-side tool
          try {
            // Handle both OpenAI format (function.arguments) and LangChain format (args)
            const args =
              toolCall.args || JSON.parse(toolCall.function?.arguments || "{}");
            const result = await this.executeServerTool(
              toolName,
              args,
              userId,
              threadId
            );

            serverToolResults.push({
              tool_call_id: toolCall.id,
              name: toolName,
              result: result,
            });
          } catch (error) {
            console.error(`❌ Error executing server tool ${toolName}:`, error);
            serverToolResults.push({
              tool_call_id: toolCall.id,
              name: toolName,
              result: {
                error: `Failed to execute ${toolName}: ${error.message}`,
              },
            });
          }
        } else {
          // Forward client-side tool
          clientToolCalls.push(toolCall);
        }
      }
    }

    return { serverToolResults, clientToolCalls };
  }

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
      let currentMessages = previous_messages;
      const userId = req?.user?.id;

      if (!userId) {
        throw new Error("userId is required for tool execution");
      }

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

      currentMessages = previous_messages;
      let finalContent = "";
      let finalUsageMetadata = {};

      // Set headers for SSE (only once)
      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");

      // Tool execution loop - continue until no server tools are called
      let maxIterations = 5; // Prevent infinite loops
      let iteration = 0;

      while (iteration < maxIterations) {
        const trimmedHistory = await trimmer.invoke(currentMessages);
        const stream = llmWithTools.streamEvents(trimmedHistory, {
          version: "v2",
        });

        // Custom streaming handler to detect tool calls
        let hasServerTools = false;
        let serverToolResults: any[] = [];
        let clientToolCalls: any[] = [];
        let originalToolCalls: any[] = [];

        try {
          for await (const chunk of stream) {
            let processedChunk: any = {};

            if (chunk.event === "on_chat_model_start") {
              processedChunk = {
                type: "text_created",
                content: "",
              };
            } else if (chunk.event === "on_chat_model_stream") {
              processedChunk = {
                type: "text_delta",
                content: chunk.data?.chunk?.content || "",
              };
            } else if (chunk.event === "on_chat_model_end") {
              if (chunk.data?.output?.tool_calls.length > 0) {
                // Process tool calls
                const toolCalls = chunk.data.output.tool_calls;
                originalToolCalls = toolCalls; // Store for later use

                const {
                  serverToolResults: serverResults,
                  clientToolCalls: clientCalls,
                } = await this.processToolCalls(
                  toolCalls,
                  userId,
                  req.threadId
                );

                serverToolResults = serverResults;
                clientToolCalls = clientCalls;
                hasServerTools = serverResults.length > 0;

                if (hasServerTools) {
                  // Don't stream server tool calls to client
                  // Break out of streaming loop to continue conversation with tool results
                  break;
                } else {
                  // Only client tools - forward them
                  processedChunk = {
                    type: "tool_call",
                    tool_call: {
                      tools: clientCalls,
                      signatures: chunk.data?.output?.additional_kwargs,
                    },
                  };
                }
              } else {
                // Regular text completion
                processedChunk = {
                  type: "text_done",
                  content: chunk.data?.output?.content || "",
                };
                finalContent = chunk.data?.output?.content || "";
                finalUsageMetadata = chunk.data?.output?.usage_metadata || {};
              }
            }

            // Only write to response if we have a valid chunk and no server tools
            if (
              processedChunk.type &&
              ["text_created", "text_delta", "text_done", "tool_call"].includes(
                processedChunk.type
              )
            ) {
              res.write(`data: ${JSON.stringify(processedChunk)}\n\n`);
            }
          }

          // If we have server tool results, continue the conversation
          if (hasServerTools && serverToolResults.length > 0) {
            // First, add the assistant message with tool calls
            const assistantMessage = new AIMessage({
              content: "",
              tool_calls: originalToolCalls.map((tc) => ({
                name: tc.name,
                args: tc.args,
                id: tc.id,
              })),
            });

            // Then add tool results
            const toolMessages = serverToolResults.map((result) => {
              return new ToolMessage({
                content: JSON.stringify({ results: result.result }),
                tool_call_id: result.tool_call_id,
              });
            });

            currentMessages = [
              ...currentMessages,
              assistantMessage,
              ...toolMessages,
            ];
            iteration++;
            continue; // Continue the loop to get the next response
          } else {
            // No more server tools, we're done
            break;
          }
        } catch (streamError) {
          console.error("Streaming error:", streamError);
          throw streamError;
        }
      }

      res.end();

      // Save to memory if threadId provided
      if (req.threadId) {
        await this.memoryService.saveMessage({
          sessionId: req.threadId,
          input: req.input,
          output: finalContent,
        });
      }

      return { content: finalContent, usage_metadata: finalUsageMetadata };
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
