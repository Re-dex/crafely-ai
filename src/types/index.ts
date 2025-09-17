// Common types used across the application

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface ApiKeyAuth {
  apiKey: string;
}

export interface ChatCompletionRequest {
  messages: ChatMessage[];
  model?: string;
  temperature?: number;
  stream?: boolean;
}

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface StreamResponse {
  id: string;
  content: string;
  done: boolean;
}

// RAG Service Types
export interface CreateDocumentInput {
  userId: string;
  threadId?: string;
  filePath: string;
  filename?: string;
  mimeType?: string;
  title?: string;
  chunkSize?: number;
  chunkOverlap?: number;
}

export interface QueryInput {
  userId: string;
  threadId?: string;
  query: string;
  topK?: number;
}

export interface DocumentMetadata {
  userId: string;
  threadId?: string;
  documentId: string;
  filename?: string;
  title?: string;
  mimeType?: string;
  chunkIndex: number;
}

export interface RagWorkflowResult {
  answer: string;
  confidence: number;
  documents: any[];
  metadata: {
    retrievalTime: number;
    processingTime: number;
    totalTime: number;
  };
}

export interface DocumentStats {
  documentCount: number;
  chunkCount: number;
}
