import { BufferMemory } from "langchain/memory";
import { UpstashRedisChatMessageHistory } from "@langchain/community/stores/message/upstash_redis";
import { config } from "../config/env.config";
import { AIMessage } from "@langchain/core/messages";

export class MemoryService {
  getMemory(sessionId: string) {
    return new BufferMemory({
      memoryKey: "history",
      returnMessages: true,
      chatHistory: new UpstashRedisChatMessageHistory({
        sessionId,
        config: config.upstashRedis,
      }),
    });
  }

  async getMessages(sessionId: string) {
    const messages = await this.getContext(sessionId);
    const formattedMessages = messages.map((msg) => ({
      role: msg._getType() === "human" ? "user" : "assistant",
      content: msg.content,
    }));
    return formattedMessages;
  }

  async getContext(sessionId: string) {
    const memory = this.getMemory(sessionId);
    return await memory.loadMemoryVariables({}).then((vars) => {
      return vars.history;
    });
  }

  async saveMessage({ sessionId, input, output }) {
    const memory = this.getMemory(sessionId);
    if (input && output) {
      await memory.saveContext({ input }, { output });
      return;
    }
    if (input) {
      await this.saveUserMessage(memory, input);
      return;
    }

    if (output) {
      await this.saveAiMessage(memory, output);
    }
  }

  async saveAiMessage(memory, message) {
    await memory.chatHistory.addAIChatMessage(message);
  }

  async saveUserMessage(memory, message) {
    await memory.chatHistory.addUserMessage(message);
  }
}
