import { ChatOpenAI } from "@langchain/openai";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { RunnableSequence } from "@langchain/core/runnables";
import { config } from "../config/env.config";
import { handleStream } from "../utils";
import { MemoryService } from "./memory.service";

export class ChatService {
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

  async streamChat(req: any, res: any) {
    try {
      const memory = this.memoryService.getMemory(req.sessionId);
      const prompt = ChatPromptTemplate.fromTemplate(
        `You are an AI assistant,
        previous conversation: {history}
        Query: {input}`
      );
      const chain = RunnableSequence.from([
        {
          input: (initialInput) => initialInput,
          memory: () => memory.loadMemoryVariables({}),
        },
        {
          input: (previousInput) => previousInput.input,
          history: (previousInput) => previousInput.memory.history,
        },
        prompt,
        this.model,
      ]);
      const stream = chain.streamEvents(req.input, {
        version: "v2",
      });
      const finalOutput = await handleStream(stream, res, (chunk) => {
        return {
          type: chunk.type,
          content: chunk.content,
        };
      });
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
    return this.memoryService.getMessages(req.sessionId);
  }
}
