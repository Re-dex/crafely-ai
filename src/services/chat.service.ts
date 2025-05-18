import { ChatOpenAI } from "@langchain/openai";
import {
  ChatPromptTemplate,
  SystemMessagePromptTemplate,
} from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
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

  constructor() {
    // const openAIClient = wrapOpenAI(new OpenAI());

    this.model = new ChatOpenAI({
      openAIApiKey: config.openai.apiKey,
      modelName: config.openai.model,
      temperature: config.openai.temperature,
    });
  }

  async streamChat(req: any, res: any) {
    try {
      const messages = convertToLangChainMessages(req.messages);
      this.model.bindTools([multiply, webSearch]);
      const stream = await this.model.stream(messages);
      await handleStream(stream, res, (chunk) => {
        return { content: chunk.content };
      });
    } catch (error) {
      console.error("Streaming error:", error);
      throw error;
    }
  }

  async chat(req: any) {
    const messages = convertToLangChainMessages(req.messages);
    let response = await this.model.invoke(messages);
    return {
      content: response.content,
      role: "assistant",
    };
  }
}
