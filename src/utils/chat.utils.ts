import {
  HumanMessage,
  SystemMessage,
  AIMessage,
} from "@langchain/core/messages";
import { CheerioWebBaseLoader } from "@langchain/community/document_loaders/web/cheerio";

import { ChatOpenAI } from "@langchain/openai";
import { tool } from "@langchain/core/tools";
import { z } from "zod";
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

export const multiply = tool(
  ({ a, b }: { a: number; b: number }): number => {
    /**
     * Multiply a and b.
     */
    console.log("multiply", a, b);
    return a * b;
  },
  {
    name: "multiply",
    description: "Multiply two numbers",
    schema: z.object({
      a: z.number(),
      b: z.number(),
    }),
  }
);

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
