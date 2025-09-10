import { Request, Response } from "express";
import { RagService } from "../services/rag.service";
import { prisma } from "../database/prisma";
import { OpenAiService } from "../services/openai.service";
import { config } from "../config/env.config";
import { UsageRecorderService } from "../services/usageRecorder.service";

export class RagController {
  private rag: RagService;
  private usageRecorder: UsageRecorderService;
  constructor(ragService = new RagService()) {
    this.rag = ragService;
    this.usageRecorder = new UsageRecorderService();
  }

  upload = async (req: any, res: Response) => {
    try {
      const userId = req?.user?.id;
      if (!userId) {
        res.status(401).json({ success: false, message: "Unauthorized" });
        return;
      }

      const file = req.file as Express.Multer.File;
      if (!file) {
        res.status(400).json({ success: false, message: "No file uploaded" });
        return;
      }

      const doc = await this.rag.createDocument({
        userId,
        threadId: req.body?.threadId || req.query?.threadId,
        filePath: file.path,
        filename: file.originalname,
        mimeType: file.mimetype,
        title: file.originalname,
      });

      res.status(201).json({ success: true, document: doc });
    } catch (error: any) {
      res
        .status(500)
        .json({ success: false, message: error?.message || "Upload failed" });
    }
  };

  query = async (req: any, res: Response) => {
    try {
      const userId = req?.user?.id;
      if (!userId) {
        res.status(401).json({ success: false, message: "Unauthorized" });
        return;
      }
      const { query, topK, threadId } = req.body || {};
      if (!query) {
        res.status(400).json({ success: false, message: "query is required" });
        return;
      }

      const results = await this.rag.query({ userId, threadId, query, topK });
      res.status(200).json({ success: true, results });
    } catch (error: any) {
      res
        .status(500)
        .json({ success: false, message: error?.message || "Query failed" });
    }
  };

  chat = async (req: any, res: Response) => {
    try {
      const userId = req?.user?.id;
      if (!userId) {
        res.status(401).json({ success: false, message: "Unauthorized" });
        return;
      }

      const message: string | undefined = req.body?.message;
      const requestThreadId: string | undefined = req.body?.threadId;
      const model: string =
        req.body?.model || config.openai.model || "gpt-4o-mini";
      const requestedTopK: number | undefined = req.body?.topK;

      if (!message || typeof message !== "string" || !message.trim()) {
        res
          .status(400)
          .json({ success: false, message: "message is required" });
        return;
      }

      const topK = Math.min(Math.max(Number(requestedTopK || 5), 1), 10);

      // Validate thread ownership if provided
      let threadId: string | undefined = requestThreadId;
      if (threadId) {
        const thread = await prisma.thread.findFirst({
          where: { id: threadId, userId },
        });
        if (!thread) {
          res
            .status(403)
            .json({ success: false, message: "Invalid threadId for user" });
          return;
        }
      }

      const openai = new OpenAiService() as any;
      const sdk = openai.sdk as any;

      const toolName = "fileSearch";
      const tools = [
        {
          type: "function",
          function: {
            name: toolName,
            description:
              "Search the user's uploaded documents (thread-first fallback to user) and return top K relevant chunks.",
            parameters: {
              type: "object",
              properties: {
                query: { type: "string" },
                topK: { type: "integer", minimum: 1, maximum: 10 },
              },
              required: ["query"],
              additionalProperties: false,
            },
          },
        },
      ];

      const systemPrompt = [
        "You are a helpful assistant that can search the user's uploaded PDFs.",
        "When answering questions that may require knowledge from the user's files, call the fileSearch tool.",
        "When you use fileSearch results, quote succinctly and cite with (doc: <documentId>#<chunkIndex>).",
        "If no sources are found, say you couldn't find relevant sources in the user's files.",
      ].join("\n");

      const messages: any[] = [
        { role: "system", content: systemPrompt },
        { role: "user", content: message },
      ];

      // First turn: allow tool calls
      const first = await sdk.chat.completions.create({
        model,
        messages,
        tools,
        tool_choice: "auto",
      });

      const choice = first.choices?.[0];
      const toolCalls = choice?.message?.tool_calls || [];
      let retrievalResults: any[] = [];
      let assistantMessages: any[] = [];

      if (toolCalls.length > 0) {
        // Append the assistant tool call message
        assistantMessages.push(choice.message);

        for (const t of toolCalls) {
          if (t.type === "function" && t.function?.name === toolName) {
            let args: any = {};
            try {
              args = JSON.parse(t.function.arguments || "{}");
            } catch (_e) {
              args = {};
            }

            const q =
              typeof args.query === "string" && args.query.trim()
                ? args.query
                : message;
            const k = Math.min(Math.max(Number(args.topK || topK), 1), 10);
            const effectiveThreadId: string | undefined = threadId;

            retrievalResults = await this.rag.query({
              userId,
              threadId: effectiveThreadId,
              query: q,
              topK: k,
            });

            const toolResultPayload = retrievalResults.map((r) => ({
              content: r.content,
              documentId: r.documentId,
              index: r.index,
              similarity: r.similarity,
            }));

            messages.push(assistantMessages[0]);
            messages.push({
              role: "tool",
              tool_call_id: t.id,
              content: JSON.stringify({ results: toolResultPayload }),
            });
          }
        }
      }

      // Second turn: get final answer
      const second = await sdk.chat.completions.create({ model, messages });
      const finalChoice = second.choices?.[0];
      const answer = finalChoice?.message?.content || "";

      // Build citations
      const citations = Array.from(
        new Set(
          (retrievalResults || []).map((r: any) => `${r.documentId}#${r.index}`)
        )
      );

      // Prepare previews and flags
      const previews = (retrievalResults || []).map((r: any) => ({
        documentId: r.documentId,
        index: r.index,
        preview: (r.content || "").slice(0, 200),
        similarity: r.similarity,
      }));
      const noSources = (retrievalResults || []).length === 0;

      // Record usage (use second response where possible)
      const usageMeta = second.usage || first.usage || {};
      await this.usageRecorder.recordFromRequest(
        req,
        {
          input_tokens: usageMeta.prompt_tokens || 0,
          output_tokens: usageMeta.completion_tokens || 0,
          total_tokens:
            usageMeta.total_tokens ||
            (usageMeta.prompt_tokens || 0) + (usageMeta.completion_tokens || 0),
        },
        {
          provider: "openai",
          model,
          type: "chat",
          metadata: {
            isRag: true,
            topK: topK,
            threadId: threadId,
            numChunksReturned: retrievalResults?.length || 0,
          },
        }
      );

      res.status(200).json({
        success: true,
        answer,
        citations,
        previews,
        noSources,
        toolCalls: toolCalls.map((t: any) => ({
          name: t.function?.name,
          arguments: t.function?.arguments,
        })),
        usage: {
          prompt_tokens: usageMeta.prompt_tokens || 0,
          completion_tokens: usageMeta.completion_tokens || 0,
          total_tokens: usageMeta.total_tokens || 0,
        },
      });
    } catch (error: any) {
      res
        .status(500)
        .json({ success: false, message: error?.message || "Chat failed" });
    }
  };
}

export default new RagController();
