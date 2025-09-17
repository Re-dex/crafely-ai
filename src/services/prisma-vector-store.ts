import { Embeddings } from "@langchain/core/embeddings";
import { Document } from "@langchain/core/documents";
import { BaseRetriever } from "@langchain/core/retrievers";
import { prisma } from "../database/prisma";

export interface PrismaVectorStoreConfig {
  userId: string;
  threadId?: string;
  topK?: number;
}

export class PrismaVectorStore {
  private embeddings: Embeddings;
  private userId: string;
  private threadId?: string;
  private topK: number;

  constructor(embeddings: Embeddings, config: PrismaVectorStoreConfig) {
    this.embeddings = embeddings;
    this.userId = config.userId;
    this.threadId = config.threadId;
    this.topK = config.topK || 5;
  }

  /**
   * Similarity search using Prisma database
   */
  async similaritySearchVectorWithScore(
    query: number[],
    k: number = this.topK
  ): Promise<[Document, number][]> {
    // Get document chunks from Prisma
    let candidates: any[] = [];

    if (this.threadId) {
      // Query within specific thread
      const threadDocs = await prisma.document.findMany({
        where: { userId: this.userId, threadId: this.threadId },
        select: { id: true },
      });
      const threadDocIds = threadDocs.map((d) => d.id);

      if (threadDocIds.length > 0) {
        candidates = await prisma.documentChunk.findMany({
          where: { userId: this.userId, documentId: { in: threadDocIds } },
          select: {
            id: true,
            documentId: true,
            index: true,
            content: true,
            embedding: true,
          },
          take: Math.max(k * 20, 100),
          orderBy: { createdAt: "desc" },
        });
      }
    } else {
      // Query all user documents
      candidates = await prisma.documentChunk.findMany({
        where: { userId: this.userId },
        select: {
          id: true,
          documentId: true,
          index: true,
          content: true,
          embedding: true,
        },
        take: Math.max(k * 20, 100),
        orderBy: { createdAt: "desc" },
      });
    }

    if (candidates.length === 0) {
      return [];
    }

    // Calculate cosine similarity
    const similarity = (a: number[], b: number[]) => {
      let dot = 0;
      let aNorm = 0;
      let bNorm = 0;
      const len = Math.min(a.length, b.length);
      for (let i = 0; i < len; i++) {
        const av = a[i];
        const bv = b[i];
        dot += av * bv;
        aNorm += av * av;
        bNorm += bv * bv;
      }
      if (aNorm === 0 || bNorm === 0) return 0;
      return dot / (Math.sqrt(aNorm) * Math.sqrt(bNorm));
    };

    // Calculate similarities and sort
    const scored = candidates.map((candidate) => ({
      ...candidate,
      similarity: similarity(
        query,
        (candidate.embedding as unknown as number[]) || []
      ),
    }));

    scored.sort((a, b) => b.similarity - a.similarity);

    // Convert to LangChain Document format
    const results: [Document, number][] = scored
      .slice(0, k)
      .map((candidate) => [
        new Document({
          pageContent: candidate.content,
          metadata: {
            id: candidate.id,
            documentId: candidate.documentId,
            index: candidate.index,
            userId: this.userId,
            threadId: this.threadId,
          },
        }),
        candidate.similarity,
      ]);

    return results;
  }

  /**
   * Similarity search (without scores)
   */
  async similaritySearch(
    query: string,
    k: number = this.topK
  ): Promise<Document[]> {
    const queryEmbedding = await this.embeddings.embedQuery(query);
    const results = await this.similaritySearchVectorWithScore(
      queryEmbedding,
      k
    );
    return results.map(([doc]) => doc);
  }

  /**
   * Similarity search with scores
   */
  async similaritySearchWithScore(
    query: string,
    k: number = this.topK
  ): Promise<[Document, number][]> {
    const queryEmbedding = await this.embeddings.embedQuery(query);
    return this.similaritySearchVectorWithScore(queryEmbedding, k);
  }

  /**
   * Create a retriever from this vector store
   */
  asRetriever(k?: number): BaseRetriever {
    return new PrismaVectorStoreRetriever({
      vectorStore: this,
      k: k || this.topK,
    });
  }
}

/**
 * Custom retriever for PrismaVectorStore
 */
class PrismaVectorStoreRetriever extends BaseRetriever {
  private vectorStore: PrismaVectorStore;
  private k: number;

  lc_namespace = ["langchain", "retrievers", "prisma"];

  constructor(config: { vectorStore: PrismaVectorStore; k: number }) {
    super();
    this.vectorStore = config.vectorStore;
    this.k = config.k;
  }

  async _getRelevantDocuments(query: string): Promise<Document[]> {
    return this.vectorStore.similaritySearch(query, this.k);
  }
}
