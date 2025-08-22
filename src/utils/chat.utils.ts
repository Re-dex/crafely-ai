import {
  HumanMessage,
  SystemMessage,
  AIMessage,
} from "@langchain/core/messages";
import { CheerioWebBaseLoader } from "@langchain/community/document_loaders/web/cheerio";
import { z } from "zod";
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
    console.log("finalOutput", finalOutput);
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
    console.log(message);
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

// Define the schema separately to avoid deep nesting
const multiplySchema = z.object({
  a: z.number(),
  b: z.number(),
});

// Create a function for multiplication
const multiplyFunction = ({ a, b }: { a: number; b: number }): number => {
  console.log("multiply", a, b);
  return a * b;
};

// Export the multiply tool with a simpler structure
export const multiply = {
  name: "multiply",
  description: "Multiply two numbers",
  func: multiplyFunction,
  schema: multiplySchema,
};

export const webSearch = async () => {
  const loaderWithSelector = new CheerioWebBaseLoader(
    "https://news.ycombinator.com/item?id=34817881",
    {
      selector: "p",
    }
  );

  const docsWithSelector = await loaderWithSelector.load();
  docsWithSelector[0].pageContent;
};
