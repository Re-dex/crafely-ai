import { RagService } from "./rag.service";

export interface FileSearchToolArgs {
  query: string;
  topK?: number;
}

export interface FileSearchToolResult {
  content: string;
  documentId: string;
  index: number;
  similarity: number;
}

export class FileSearchToolService {
  private ragService: RagService;

  constructor(ragService = new RagService()) {
    this.ragService = ragService;
  }

  /**
   * Get the fileSearch tool schema for OpenAI function calling
   */
  getToolSchema() {
    return {
      type: "function" as const,
      function: {
        name: "fileSearch",
        description:
          "Search the user's uploaded documents (thread-first fallback to user) and return top K relevant chunks.",
        parameters: {
          type: "object",
          properties: {
            query: {
              type: "string",
              description: "The search query to find relevant document chunks",
            },
            topK: {
              type: "integer",
              minimum: 1,
              maximum: 10,
              description: "Number of top results to return (default: 5)",
            },
          },
          required: ["query"],
          additionalProperties: false,
        },
      },
    };
  }

  /**
   * Execute the fileSearch tool with given arguments
   */
  async execute(
    args: FileSearchToolArgs,
    userId: string,
    threadId?: string,
    defaultTopK: number = 5
  ): Promise<FileSearchToolResult[]> {
    const { query, topK } = args;

    // Validate and sanitize inputs
    const k = Math.min(Math.max(Number(topK || defaultTopK), 1), 10);

    if (!query || typeof query !== "string" || !query.trim()) {
      throw new Error("Query is required and must be a non-empty string");
    }

    try {
      console.log(
        `🔍 FileSearch: Searching for "${query.trim()}" in thread ${
          threadId || "all"
        }`
      );

      // Execute the search using RAG service
      const results = await this.ragService.query({
        userId,
        threadId,
        query: query.trim(),
        topK: k,
      });

      console.log(`✅ FileSearch: Found ${results.length} results`);

      // Format results to match expected structure
      return results.map((r) => ({
        content: r.content,
        documentId: r.documentId,
        index: r.index,
        similarity: r.similarity,
      }));
    } catch (error) {
      console.error("FileSearch tool execution error:", error);

      // Return empty results instead of throwing to prevent chat failure
      return [];
    }
  }

  /**
   * Get system prompt instructions for fileSearch tool usage
   */
  getSystemPromptInstructions(): string[] {
    return [
      "You are a helpful assistant that can search the user's uploaded PDFs.",
      "When answering questions that may require knowledge from the user's files, call the fileSearch tool.",
      "When you use fileSearch results, quote succinctly and cite with (doc: <documentId>#<chunkIndex>).",
      "If no sources are found, say you couldn't find relevant sources in the user's files.",
    ];
  }
}
