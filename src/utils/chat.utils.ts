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
  let finalOutput: any = {
    content: "",
    usage_metadata: {},
  };
  try {
    for await (const chunk of stream) {
      if (chunk.event === "on_chat_model_start") {
        chunk.type = "text_created";
        chunk.content = "";
      }
      if (chunk.event === "on_chat_model_stream") {
        chunk.type = "text_delta";
        chunk.content = chunk.data?.chunk?.content || "";
      }
      if (chunk.event === "on_chat_model_end") {
        if (chunk.data?.output?.tool_calls.length > 0) {
          chunk.type = "tool_call";
          chunk.tool_call = {
            tools: chunk.data?.output?.tool_calls,
            signatures: chunk.data?.output?.additional_kwargs,
          };
          finalOutput = null;
        } else {
          chunk.type = "text_done";
          chunk.content = chunk.data?.output?.content || "";
          finalOutput.content = chunk.content;
          finalOutput.usage_metadata = chunk.data?.output?.usage_metadata;
        }
      }

      if (
        ["text_created", "text_delta", "text_done", "tool_call"].includes(
          chunk.type
        )
      ) {
        res.write(`data: ${JSON.stringify(cb(chunk))}\n\n`);
      }
    }
    res.end();
    return finalOutput;
  } catch (error) {
    console.error("Streaming error:", error);
    throw error;
  }
};

export const convertToLangChainMessages = (data: string | ChatMessage[]) => {
  if (typeof data === "string") {
    return [new HumanMessage(data)];
  }
  return (data || []).map((message) => {
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
