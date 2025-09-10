## RAG Chat API – Phase-by-Phase Implementation Plan

This document outlines the plan to build a server-side RAG-enabled chat API that lets users upload PDFs, semantically search relevant chunks, and synthesize responses with citations. Frontend is out of scope for now.

### What’s already done

- Prisma models:
  - `Document` (now includes optional `threadId` for scoping)
  - `DocumentChunk` (stores `Float[]` embeddings)
- Services and endpoints:
  - `RagService` with PDF parsing, chunking, embeddings via `text-embedding-3-small`, storage, and cosine-similarity search
  - Thread-first retrieval, fallback to user-scope
  - `POST /api/v1/rag/upload` (multipart) and `POST /api/v1/rag/query` (JSON)
  - Behind API key middleware; usage-ready
- Docs: `docs/api/RAG.md` updated to include `threadId` in examples
- Pending migration (if not yet run):
  - `npx prisma migrate dev --name add_thread_to_document`

---

### Phase 0 — Prerequisites & Decisions

- Ensure environment vars: `OPENAI_API_KEY`, `DATABASE_URL`.
- Run migrations and generate Prisma client.
- Decide search backend for production scaling:
  - Keep `Float[]` + cosine in app (current implementation), or
  - Adopt `pgvector` for ANN and server-side similarity in SQL (future phase).

### Phase 1 — Data & Scoping Model

- Use existing `Thread` for conversations. Clients pass `threadId`.
- Scoping logic (implemented):
  - If `threadId` provided: search only documents attached to that thread.
  - If insufficient or `threadId` empty: fallback to all user documents.
- Continue storing embeddings per chunk, include `documentId`, `index`.

### Phase 2 — Tooling: fileSearch

- Define an LLM tool callable by the model:
  - name: `fileSearch`
  - description: "Search the user's uploaded documents (thread-first fallback to user) and return top K relevant chunks."
  - input schema: `{ query: string; topK?: number; threadId?: string }`
- Resolver implementation (server):
  - Validate `userId` from API key middleware
  - Call `RagService.query({ userId, threadId, query, topK })`
  - Return: `[{ content, documentId, index, similarity }]` and optional doc metadata

### Phase 3 — Chat Endpoint (Server-Orchestrated Tools)

- Route: `POST /api/v1/rag/chat`
- Request body: `{ message: string; threadId?: string; model?: string; topK?: number }`
- Behavior:
  1. Build a system prompt that instructs the model to call `fileSearch` when the answer may require knowledge from user files.
  2. Provide tool schema (OpenAI tools) and allow tool invocation.
  3. When the model calls `fileSearch`, execute resolver → return results as tool output.
  4. Resume the model to synthesize an answer, citing `documentId#index` pairs or short previews.
  5. Return `{ answer, citations: [...], toolCalls: [...], usage: {...} }`.
- Validation & limits:
  - Enforce `topK <= 10`, message length limits, and require non-empty `message`.
  - If no documents exist or no results, return an answer with "no sources found" indicator.

### Phase 4 — Answer Synthesis & Prompting

- Include clear instructions for citing sources:
  - "When you use `fileSearch` results, quote succinctly and cite with `(doc: <documentId>#<chunkIndex>)`."
- Optional: merge overlapping chunks and deduplicate before sending to the model.
  - Heuristic: group by `documentId`, sort by `similarity`, take top N, trim to token budget.

### Phase 5 — Usage Recording & Costing

- Reuse `UsageRecorderService` to log chat usage.
- Metadata: `{ isRag: true, topK, threadId, numChunksReturned }`.
- Persist `threadId` in records for auditability.

### Phase 6 — Observability & Logging

- Log: tool calls, retrieval latency, total tokens, `topK` used.
- Optional: integrate LangSmith traces for request graphs.
- Add minimal error logs for resolver exceptions.

### Phase 7 — Safety & Security

- Scope all searches by `userId` (and `threadId` when present) — enforced in `RagService`.
- Rate limit `/api/v1/rag/chat`.
- Sanitize returned chunk previews (remove binary/markdown injections).
- Validate `threadId` belongs to `req.user.id`.

### Phase 8 — Streaming (Optional)

- Add SSE support for `/api/v1/rag/chat` to stream tokens.
- Stream markers when tool is called: e.g., `event: tool_start`, `event: tool_end`.

### Phase 9 — Scalability Enhancements (Optional)

- Switch to `pgvector` for similarity in SQL; create index `ivfflat` or `hnsw`.
- Add re-ranking (e.g., cross-encoder) for improved relevance.
- Introduce caching for frequent queries (keyed by normalized query + scope).

### Phase 10 — Document Lifecycle (Optional, later)

- List user/thread documents; delete/reindex endpoints.
- On re-upload, soft-delete old chunks for the document or create a new version.

---

## API Shapes (Summary)

### Upload PDF (done)

- `POST /api/v1/rag/upload`
- multipart/form-data: `file`, optional `threadId`
- Response: `{ success, document }`

### Query Chunks (done)

- `POST /api/v1/rag/query`
- JSON: `{ query, topK?, threadId? }`
- Response: `{ success, results: [{ id, documentId, index, content, similarity }] }`

### Chat with Tools (to implement)

- `POST /api/v1/rag/chat`
- JSON: `{ message, threadId?, model?, topK? }`
- Response: `{ success, answer, citations: [...], toolCalls: [...], usage: {...} }`

---

## Implementation Checklist

- Chat endpoint with tool orchestration

  - [ ] Define `fileSearch` tool schema for OpenAI
  - [ ] Implement resolver that delegates to `RagService.query`
  - [ ] Implement orchestration loop (handle tool call → provide results → finalize answer)
  - [ ] Add answer synthesis prompt template with citation guidance
  - [ ] Return citations and minimal previews
  - [ ] Record usage via `UsageRecorderService`

- Validation & limits

  - [ ] Enforce `topK` bounds, message size, `threadId` ownership

- Observability & safety

  - [ ] Add structured logs (latency, topK, tokens)
  - [ ] Rate limit endpoint

- Optional enhancements
  - [ ] SSE streaming
  - [ ] pgvector migration & indexes
  - [ ] Re-ranking & caching

---

## Notes

- Embeddings: `text-embedding-3-small` (current). Can be upgraded per cost/quality requirements.
- Current similarity is in-application cosine over `Float[]`. Consider `pgvector` for production scale.
- Scoping prioritizes `threadId` to reduce noise when users have many documents.
