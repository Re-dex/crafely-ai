# RAG Service Refactor with LangChain

This document describes the refactored RAG (Retrieval-Augmented Generation) service that now uses LangChain for improved functionality and maintainability.

## Overview

The RAG service has been completely refactored to leverage:

- **LangChain**: For document loading, text splitting, embeddings, and vector stores
- **Prisma**: For persistent storage of embeddings and metadata
- **TypeScript**: For better type safety and developer experience

## Architecture

### Core Components

1. **RagService** (`src/services/rag.service.ts`)

   - Basic RAG functionality using LangChain
   - Document processing with PDF loaders and text splitters
   - Vector store operations with similarity search
   - Database integration for persistence

2. **PrismaVectorStore** (`src/services/prisma-vector-store.ts`)

   - Custom vector store implementation using Prisma
   - Direct database queries for similarity search
   - Efficient memory usage with persistent storage

3. **Types** (`src/types/index.ts`)
   - TypeScript interfaces for all RAG operations
   - Consistent type definitions across services

## Key Features

### LangChain Integration

- **Document Loaders**: PDF documents loaded using `PDFLoader` from `@langchain/community`
- **Text Splitters**: `RecursiveCharacterTextSplitter` for intelligent chunking
- **Embeddings**: OpenAI embeddings using `OpenAIEmbeddings`
- **Vector Stores**: `PrismaVectorStore` for direct database similarity search
- **Retrievers**: LangChain retrievers for document search

### Enhanced Functionality

- **Flexible Chunking**: Configurable chunk size and overlap
- **Thread Support**: Document organization by conversation threads
- **Statistics**: Document and chunk counting
- **Error Handling**: Robust error handling and edge case management

## Usage Examples

### Basic RAG Service

```typescript
import { RagService } from "./services/rag.service";

const ragService = new RagService();

// Create a document
const document = await ragService.createDocument({
  userId: "user-123",
  threadId: "thread-456",
  filePath: "/path/to/document.pdf",
  filename: "example.pdf",
  title: "Example Document",
  chunkSize: 1000,
  chunkOverlap: 200,
});

// Query the document
const results = await ragService.query({
  userId: "user-123",
  threadId: "thread-456",
  query: "What is the main topic?",
  topK: 5,
});

// Get statistics
const stats = await ragService.getDocumentStats("user-123", "thread-456");
```

### Advanced RAG with Custom Configuration

```typescript
// Create multiple documents with different chunking strategies
const documents = [
  {
    userId: "user-123",
    threadId: "thread-456",
    filePath: "/path/to/document1.pdf",
    filename: "document1.pdf",
    title: "Technical Specification",
    chunkSize: 500,
    chunkOverlap: 100,
  },
  {
    userId: "user-123",
    threadId: "thread-456",
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
  console.log(`Created document: ${document.title}`);
}
```

### Advanced Usage

```typescript
// Create a retriever for custom operations
const retriever = await ragService.createRetriever(
  "user-123",
  "thread-456",
  10
);

// Use with LangChain chains
const chain = retriever.pipe(llm).pipe(outputParser);
const response = await chain.invoke("Your question here");
```

## Configuration

### Environment Variables

```env
OPENAI_API_KEY=your_openai_api_key_here
```

### Chunking Configuration

```typescript
const textSplitter = new RecursiveCharacterTextSplitter({
  chunkSize: 1000, // Maximum characters per chunk
  chunkOverlap: 200, // Overlap between chunks
  separators: ["\n\n", "\n", " ", ""], // Splitting hierarchy
});
```

### Embedding Configuration

```typescript
const embeddings = new OpenAIEmbeddings({
  modelName: "text-embedding-3-small",
  openAIApiKey: process.env.OPENAI_API_KEY,
});
```

## Performance Improvements

### LangChain Optimizations

- **Efficient Document Processing**: LangChain's optimized document loaders
- **Smart Text Splitting**: Recursive character splitting with configurable separators
- **Batch Embedding**: Efficient batch processing of document chunks
- **Memory Management**: Optimized vector store operations

### Prisma Integration Benefits

- **Persistent Storage**: All embeddings stored in your existing database
- **Efficient Queries**: Direct database queries without memory overhead
- **Scalability**: Scales with your database, not server memory
- **Reliability**: Data survives server restarts and deployments

## Migration from Old RAG Service

### Breaking Changes

1. **Constructor**: Now takes optional `OpenAiService` parameter
2. **Method Signatures**: Some methods have updated signatures
3. **Return Types**: Enhanced return types with additional metadata

### Backward Compatibility

The refactored service provides backward compatibility:

- `query()` - Same interface as original
- `createDocument()` - Same interface as original
- `getDocumentStats()` - Same interface as original

### Migration Steps

1. Update imports to use new services
2. Replace direct embedding calls with LangChain embeddings
3. Update text splitting to use `RecursiveCharacterTextSplitter`
4. Use the PrismaVectorStore for efficient database queries

## Error Handling

### Common Issues

1. **Missing API Key**: Ensure `OPENAI_API_KEY` is set
2. **File Not Found**: Verify file paths exist
3. **Invalid Chunk Size**: Use reasonable chunk sizes (100-2000 characters)
4. **Memory Issues**: Consider using smaller batch sizes for large documents

### Debugging

- Enable LangChain tracing for detailed logs
- Use the metadata in workflow results for performance analysis
- Check confidence scores to identify low-quality retrievals

## Future Enhancements

### Planned Features

1. **Multiple Document Types**: Support for more file formats
2. **Advanced Retrievers**: Hybrid search with keyword and semantic search
3. **Caching**: Implement embedding and retrieval caching
4. **Streaming**: Support for streaming responses
5. **Custom Workflows**: Allow users to define custom RAG processing pipelines

### Integration Opportunities

1. **LangSmith**: Integration for monitoring and debugging
2. **Vector Databases**: Support for persistent vector stores
3. **Custom Embeddings**: Support for different embedding models
4. **Advanced Chunking**: Support for semantic chunking strategies

## Testing

Run the example file to test the refactored services:

```bash
npx ts-node src/examples/rag-usage.ts
```

This will demonstrate all the key features and usage patterns of the refactored RAG services.

## Conclusion

The refactored RAG service provides a modern, maintainable, and extensible foundation for retrieval-augmented generation using LangChain. The new architecture offers better performance, improved developer experience, and a clear path for future enhancements.
