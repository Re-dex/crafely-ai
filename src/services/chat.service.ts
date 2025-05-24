import { ChatOpenAI } from "@langchain/openai";
import {
  ChatPromptTemplate,
  SystemMessagePromptTemplate,
} from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { BufferMemory } from "langchain/memory";
import { RunnableSequence } from "@langchain/core/runnables";
import { UpstashRedisChatMessageHistory } from "@langchain/community/stores/message/upstash_redis";
import { config } from "../config/env.config";
import { ChatCompletionRequest } from "../types";
import {
  handleStream,
  convertToLangChainMessages,
  multiply,
  webSearch,
} from "../utils";

export class ChatService {
  private model: ChatOpenAI;
  private memory: BufferMemory;
  constructor() {
    // const openAIClient = wrapOpenAI(new OpenAI());
    this.memory = new BufferMemory({
      memoryKey: "history",
      returnMessages: true,
      chatHistory: new UpstashRedisChatMessageHistory({
        sessionId: "my_conversation",
        config: {
          url: "https://wired-wahoo-39758.upstash.io", // Override with your own instance's URL
          token: "AZtOAAIjcDEzNzFkYjI3YmJmMjY0ODE2YTEwNThkNGJiMWFjNzA0ZnAxMA", // Override with your own instance's token
        },
      }),
    });
    this.model = new ChatOpenAI({
      openAIApiKey: config.openai.apiKey,
      modelName: config.openai.model,
      temperature: config.openai.temperature,
    });
  }

  async streamChat(req: any, res: any) {
    try {
      const prompt = ChatPromptTemplate.fromTemplate(
        `You are an AI assistant,
        previous conversation: {history}
        Query: {input}`
      );
      const chain = RunnableSequence.from([
        {
          input: (initialInput) => initialInput,
          memory: () => this.memory.loadMemoryVariables({}),
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
      // await this.memory.saveContext(
      //   {
      //     input: req.input,
      //   },
      //   {
      //     output: finalOutput,
      //   }
      // );
    } catch (error) {
      console.error("Streaming error:", error);
      throw error;
    }
  }

  async getMessages(req: Request, res: any) {
    const memory = await this.memory.loadMemoryVariables({});
    return memory.history;
  }
}
