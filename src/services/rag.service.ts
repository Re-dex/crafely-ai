import { prisma } from "../database/prisma";
import { OpenAiService } from "./openai.service";
import { Document } from "@langchain/core/documents";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { OpenAIEmbeddings } from "@langchain/openai";
import { PrismaVectorStore } from "./prisma-vector-store";
import { VectorStore } from "@langchain/core/vectorstores";
import { BaseRetriever } from "@langchain/core/retrievers";
import {
  CreateDocumentInput,
  QueryInput,
  DocumentMetadata,
  DocumentStats,
} from "../types";
import fs from "fs";

export class RagService {
  private embeddings: OpenAIEmbeddings;
  private textSplitter: RecursiveCharacterTextSplitter;

  constructor(openaiService = new OpenAiService()) {
    // Initialize OpenAI embeddings using the existing service
    this.embeddings = new OpenAIEmbeddings({
      openAIApiKey: process.env.OPENAI_API_KEY,
      modelName: "text-embedding-3-small",
    });

    // Initialize text splitter with default settings
    this.textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
      separators: ["\n\n", "\n", " ", ""],
    });
  }

  /**
   * Create a document using LangChain document loaders and text splitters
   */
  async createDocument(input: CreateDocumentInput) {
    const { userId, threadId, filePath, filename, mimeType, title } = input;
    const chunkSize = input.chunkSize ?? 1000;
    const chunkOverlap = input.chunkOverlap ?? 200;

    // Update text splitter with custom settings if provided
    if (input.chunkSize || input.chunkOverlap) {
      this.textSplitter = new RecursiveCharacterTextSplitter({
        chunkSize,
        chunkOverlap,
        separators: ["\n\n", "\n", " ", ""],
      });
    }

    // Load document using LangChain PDF loader
    const loader = new PDFLoader(filePath);
    const documents = await loader.load();

    // Split documents into chunks
    const splitDocs = await this.textSplitter.splitDocuments(documents);

    // Create document record in database
    const buffer = fs.readFileSync(filePath);
    const document = await prisma.document.create({
      data: {
        userId,
        threadId,
        title: title ?? filename ?? "Untitled",
        filename,
        mimeType: mimeType ?? "application/pdf",
        sizeBytes: buffer.length,
      },
    });

    // Prepare documents with metadata for vector store
    const documentsWithMetadata = splitDocs.map((doc, index) => {
      const metadata: DocumentMetadata = {
        userId,
        threadId,
        documentId: document.id,
        filename,
        title: title ?? filename ?? "Untitled",
        mimeType: mimeType ?? "application/pdf",
        chunkIndex: index,
      };

      return new Document({
        pageContent: doc.pageContent,
        metadata: {
          ...doc.metadata,
          ...metadata,
        },
      });
    });

    // Generate embeddings and store in database
    const embeddings = await this.embeddings.embedDocuments(
      documentsWithMetadata.map((doc) => doc.pageContent)
    );

    // Store chunks in database
    await prisma.$transaction(
      documentsWithMetadata.map((doc, i) =>
        prisma.documentChunk.create({
          data: {
            documentId: document.id,
            userId,
            index: i,
            content: doc.pageContent,
            embedding: embeddings[i] as unknown as any,
          },
        })
      )
    );

    return document;
  }

  /**
   * Query documents using Prisma-based vector store
   */
  async query(input: QueryInput) {
    const { userId, threadId, query, topK = 5 } = input;

    // Create PrismaVectorStore for direct database queries
    const vectorStore = new PrismaVectorStore(this.embeddings, {
      userId,
      threadId,
      topK,
    });

    // Perform similarity search directly against Prisma database
    const results = await vectorStore.similaritySearchWithScore(query, topK);

    // Format results to match original structure
    return results.map(([doc, score]) => ({
      id: doc.metadata.id,
      documentId: doc.metadata.documentId,
      index: doc.metadata.index,
      content: doc.pageContent,
      similarity: score,
      embedding: null, // Not needed in response, already used for search
    }));
  }

  /**
   * Create a retriever for a specific user and optional thread
   */
  async createRetriever(
    userId: string,
    threadId?: string,
    topK: number = 5
  ): Promise<BaseRetriever> {
    // Create PrismaVectorStore for direct database queries
    const vectorStore = new PrismaVectorStore(this.embeddings, {
      userId,
      threadId,
      topK,
    });

    return vectorStore.asRetriever(topK);
  }

  /**
   * Get document statistics for a user
   */
  async getDocumentStats(
    userId: string,
    threadId?: string
  ): Promise<DocumentStats> {
    const whereClause = threadId ? { userId, threadId } : { userId };

    const [documentCount, chunkCount] = await Promise.all([
      prisma.document.count({ where: whereClause }),
      prisma.documentChunk.count({ where: whereClause }),
    ]);

    return {
      documentCount,
      chunkCount,
    };
  }
}
