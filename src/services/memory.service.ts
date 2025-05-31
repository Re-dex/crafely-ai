import { BufferMemory } from "langchain/memory";
import { UpstashRedisChatMessageHistory } from "@langchain/community/stores/message/upstash_redis";
import { config } from "../config/env.config";

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
    const memory = this.getMemory(sessionId);
    const messages = await memory
      .loadMemoryVariables({})
      .then((vars) => vars.history);
    const formattedMessages = messages.map((msg) => ({
      role: msg._getType() === "human" ? "user" : "assistant",
      content: msg.content,
    }));
    return formattedMessages;
  }

  async saveMessage({ sessionId, input, output }) {
    const memory = this.getMemory(sessionId);
    await memory.saveContext({ input }, { output });
  }
}
