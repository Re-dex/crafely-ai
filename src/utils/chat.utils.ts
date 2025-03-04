import {
  HumanMessage,
  SystemMessage,
  AIMessage,
} from "@langchain/core/messages";
import { ChatMessage } from "../types";
export const handleStream = async (stream: any, res: any, cb) => {
  // Set headers for SSE
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  try {
    for await (const chunk of stream) {
      if (chunk.content) {
        res.write(`data: ${JSON.stringify(cb(chunk))}\n\n`);
      }
    }
    res.end();
  } catch (error) {
    console.error("Streaming error:", error);
    throw error;
  }
};

export const convertToLangChainMessages = (messages: ChatMessage[]) => {
  return messages.map((message) => {
    switch (message.role) {
      case "system":
        return new SystemMessage(message.content);
      case "user":
        return new HumanMessage(message.content);
      case "assistant":
        return new AIMessage(message.content);
      default:
        throw new Error(`Unsupported message role: ${message.role}`);
    }
  });
};
