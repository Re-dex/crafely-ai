import { RagService } from "../services/rag.service";
import { CreateDocumentInput, QueryInput } from "../types";

/**
 * Example usage of the refactored RAG service with LangChain
 */

// Initialize service
const ragService = new RagService();

// Example 1: Basic RAG Service Usage
export async function basicRagExample() {
  console.log("=== Basic RAG Service Example ===");

  const userId = "user-123";
  const threadId = "thread-456";

  // Create a document
  const createDocInput: CreateDocumentInput = {
    userId,
    threadId,
    filePath: "/path/to/document.pdf",
    filename: "example.pdf",
    title: "Example Document",
    chunkSize: 1000,
    chunkOverlap: 200,
  };

  try {
    // Create document with LangChain document loader and text splitter
    const document = await ragService.createDocument(createDocInput);
    console.log("Document created:", document.id);

    // Query the document
    const queryInput: QueryInput = {
      userId,
      threadId,
      query: "What is the main topic of this document?",
      topK: 3,
    };

    const results = await ragService.query(queryInput);
    console.log("Query results:", results);

    // Get document statistics
    const stats = await ragService.getDocumentStats(userId, threadId);
    console.log("Document stats:", stats);

  } catch (error) {
    console.error("Error in basic RAG example:", error);
  }
}

// Example 2: Advanced RAG with Custom Configuration
export async function advancedRagExample() {
  console.log("=== Advanced RAG Example ===");

  const userId = "user-123";
  const threadId = "thread-456";

  try {
    // Create multiple documents with different chunking strategies
    const documents = [
      {
        userId,
        threadId,
        filePath: "/path/to/document1.pdf",
        filename: "document1.pdf",
        title: "Technical Specification",
        chunkSize: 500,
        chunkOverlap: 100,
      },
      {
        userId,
        threadId,
        filePath: "/path/to/document2.pdf",
        filename: "document2.pdf",
        title: "User Manual",
        chunkSize: 1500,
        chunkOverlap: 300,
      },
    ];

    // Process documents
    for (const docInput of documents) {
      const document = await ragService.createDocument(docInput);
      console.log(`Created document: ${document.title} (${document.id})`);
    }

    // Create a retriever for the thread
    const retriever = await ragService.createRetriever(userId, threadId, 10);
    console.log("Retriever created for thread");

    // Query with different strategies
    const queries = [
      "What are the technical requirements?",
      "How do I use this system?",
      "What are the main features?",
    ];

    for (const query of queries) {
      const results = await ragService.query({
        userId,
        threadId,
        query,
        topK: 5,
      });

      console.log(`Query: "${query}"`);
      console.log(`Found ${results.length} relevant chunks`);
      console.log("Top result:", results[0]?.content?.substring(0, 200) + "...");
      console.log("---");
    }

  } catch (error) {
    console.error("Error in advanced RAG example:", error);
  }
}

// Example 3: LangChain Integration Examples
export async function langchainIntegrationExample() {
  console.log("=== LangChain Integration Example ===");

  const userId = "user-123";
  const threadId = "thread-456";

  try {
    // Create a document
    const createDocInput: CreateDocumentInput = {
      userId,
      threadId,
      filePath: "/path/to/document.pdf",
      filename: "example.pdf",
      title: "Example Document",
    };

    await ragService.createDocument(createDocInput);

    // Create a retriever and use it with LangChain chains
    const retriever = await ragService.createRetriever(userId, threadId, 5);
    
    // Get relevant documents using LangChain retriever
    const documents = await retriever.getRelevantDocuments("What is this about?");
    console.log(`Retrieved ${documents.length} documents using LangChain retriever`);

    // Example of using with other LangChain components
    documents.forEach((doc, index) => {
      console.log(`Document ${index + 1}:`);
      console.log(`Content: ${doc.pageContent.substring(0, 100)}...`);
      console.log(`Metadata:`, doc.metadata);
      console.log("---");
    });

  } catch (error) {
    console.error("Error in LangChain integration example:", error);
  }
}

// Example 4: Error Handling and Edge Cases
export async function errorHandlingExample() {
  console.log("=== Error Handling Example ===");

  const userId = "user-123";

  try {
    // Query with no documents
    const results = await ragService.query({
      userId,
      query: "What is this about?",
      topK: 5,
    });

    console.log("Query with no documents:", results.length === 0 ? "No results" : "Unexpected results");

    // Get stats for non-existent thread
    const stats = await ragService.getDocumentStats(userId, "non-existent-thread");
    console.log("Stats for non-existent thread:", stats);

  } catch (error) {
    console.error("Error in error handling example:", error);
  }
}

// Example 5: Performance Testing
export async function performanceExample() {
  console.log("=== Performance Testing Example ===");

  const userId = "user-123";
  const threadId = "thread-456";

  try {
    // Create a document
    const createDocInput: CreateDocumentInput = {
      userId,
      threadId,
      filePath: "/path/to/document.pdf",
      filename: "example.pdf",
      title: "Example Document",
    };

    const startTime = Date.now();
    await ragService.createDocument(createDocInput);
    const documentTime = Date.now() - startTime;
    console.log(`Document creation took: ${documentTime}ms`);

    // Test query performance
    const queries = [
      "What is the main topic?",
      "What are the key points?",
      "What should I remember?",
    ];

    for (const query of queries) {
      const queryStart = Date.now();
      const results = await ragService.query({
        userId,
        threadId,
        query,
        topK: 3,
      });
      const queryTime = Date.now() - queryStart;

      console.log(`Query: "${query}"`);
      console.log(`Results: ${results.length} chunks`);
      console.log(`Time: ${queryTime}ms`);
      console.log("---");
    }

  } catch (error) {
    console.error("Error in performance example:", error);
  }
}

// Run all examples
export async function runAllExamples() {
  console.log("Starting RAG Service Examples...\n");

  await basicRagExample();
  console.log("\n");

  await advancedRagExample();
  console.log("\n");

  await langchainIntegrationExample();
  console.log("\n");

  await errorHandlingExample();
  console.log("\n");

  await performanceExample();
  console.log("\n");

  console.log("All examples completed!");
}

// Individual examples are already exported above