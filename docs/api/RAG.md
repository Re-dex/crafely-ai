## RAG API Usage

Simple Retrieval-Augmented Generation utilities for uploading PDFs, storing chunk embeddings, and querying relevant chunks. Embeddings use `text-embedding-3-small` and are stored in Prisma as `Float[]`.

### Prerequisites

- **Auth**: Use your existing API Key system. Send `Authorization: Bearer <API_KEY>`.
- **Env**: `OPENAI_API_KEY` and `DATABASE_URL` configured.
- **Server**: App running (default `http://localhost:4000`).

### Endpoints

- POST `/api/v1/rag/upload` — Upload a PDF, chunk, embed, and store.
- POST `/api/v1/rag/query` — Query and retrieve top similar chunks.
  - Optional scope: `threadId` to search the current conversation first, then fallback to user scope.
- POST `/api/v1/rag/chat` — Chat with server-orchestrated retrieval via tools and citations.
  - Body accepts optional `threadId`, but scoping is enforced server-side (tool cannot change it).

### Upload PDF

- Content-Type: `multipart/form-data`
- Field name: `file`
- Only PDF (`application/pdf`), up to 20MB.

Example (curl):

```bash
curl -X POST \
  'http://localhost:4000/api/v1/rag/upload' \
  -H 'Authorization: Bearer <API_KEY>' \
  -F 'file=@/absolute/path/to/document.pdf' \
  -F 'threadId=thrd_123'
```

Response (201):

```json
{
  "success": true,
  "document": {
    "id": "doc_...",
    "userId": "user_...",
    "title": "document.pdf",
    "filename": "document.pdf",
    "mimeType": "application/pdf",
    "sizeBytes": 123456,
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

### Query Chunks

- Body: `{ "query": string, "topK"?: number }`
- Returns top `topK` (default 5) most similar chunks by cosine similarity.

Example (curl):

```bash
curl -X POST \
  'http://localhost:4000/api/v1/rag/query' \
  -H 'Authorization: Bearer <API_KEY>' \
  -H 'Content-Type: application/json' \
  -d '{"query":"what does the contract say about termination?","topK":5, "threadId":"thrd_123"}'
```

Response (200):

```json
{
  "success": true,
  "results": [
    {
      "id": "dchk_...",
      "documentId": "doc_...",
      "index": 3,
      "content": "...chunk text...",
      "embedding": [ ... ],
      "similarity": 0.84
    }
  ]
}
```

### Chat with Tools

- Body: `{ "message": string, "threadId"?: string, "model"?: string, "topK"?: number }`
- Behavior: The server lets the model call `fileSearch`, resolves it via `RagService.query` (thread-first, fallback to user), then resumes the model to produce an answer with citations and previews.
- Constraints: `message` required, `topK` bounded to 1..10. `threadId` is validated to belong to the API key’s user and is not accepted from tool args.

Example (curl):

```bash
curl -X POST \
  'http://localhost:4000/api/v1/rag/chat' \
  -H 'Authorization: Bearer <API_KEY>' \
  -H 'Content-Type: application/json' \
  -d '{
    "message": "Summarize the main points of the uploaded contract.",
    "threadId": "thrd_123",
    "topK": 5,
    "model": "gpt-4o-mini"
  }'
```

Response (200):

```json
{
  "success": true,
  "answer": "The contract establishes... (doc: doc_abc#3) ...",
  "citations": ["doc_abc#3", "doc_def#1"],
  "previews": [
    {
      "documentId": "doc_abc",
      "index": 3,
      "preview": "...first 200 chars...",
      "similarity": 0.86
    },
    {
      "documentId": "doc_def",
      "index": 1,
      "preview": "...",
      "similarity": 0.81
    }
  ],
  "noSources": false,
  "toolCalls": [
    {
      "name": "fileSearch",
      "arguments": "{\"query\":\"Summarize...\",\"topK\":5}"
    }
  ],
  "usage": {
    "prompt_tokens": 123,
    "completion_tokens": 210,
    "total_tokens": 333
  }
}
```

### JS (ES6) Usage

```js
const API_KEY = "Bearer <API_KEY>";
const BASE = "http://localhost:4000/api/v1/rag";

export async function uploadPdf(file, threadId) {
  const form = new FormData();
  form.append("file", file);
  if (threadId) form.append("threadId", threadId);
  const res = await fetch(`${BASE}/upload`, {
    method: "POST",
    headers: { Authorization: API_KEY },
    body: form,
  });
  if (!res.ok) throw new Error("Upload failed");
  return res.json();
}

export async function ragQuery(query, topK = 5) {
  const res = await fetch(`${BASE}/query`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: API_KEY,
    },
    body: JSON.stringify({ query, topK }),
  });
  if (!res.ok) throw new Error("Query failed");
  return res.json();
}

export async function ragChat(message, { threadId, topK = 5, model } = {}) {
  const res = await fetch(`${BASE}/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: API_KEY,
    },
    body: JSON.stringify({ message, threadId, topK, model }),
  });
  if (!res.ok) throw new Error("Chat failed");
  return res.json();
}
```

### Vue 3 (TypeScript, script setup)

```ts
<script setup lang="ts">
const API_KEY = 'Bearer <API_KEY>';
const BASE = 'http://localhost:4000/api/v1/rag';

async function uploadPdf(file: File) {
  const form = new FormData();
  form.append('file', file);
  const res = await fetch(`${BASE}/upload`, {
    method: 'POST',
    headers: { Authorization: API_KEY },
    body: form,
  });
  if (!res.ok) throw new Error('Upload failed');
  return await res.json();
}

async function ragQuery(query: string, topK = 5) {
  const res = await fetch(`${BASE}/query`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: API_KEY,
    },
    body: JSON.stringify({ query, topK }),
  });
  if (!res.ok) throw new Error('Query failed');
  return await res.json();
}

async function ragChat(message: string, opts?: { threadId?: string; topK?: number; model?: string }) {
  const res = await fetch(`${BASE}/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: API_KEY,
    },
    body: JSON.stringify({
      message,
      threadId: opts?.threadId,
      topK: opts?.topK ?? 5,
      model: opts?.model,
    }),
  });
  if (!res.ok) throw new Error('Chat failed');
  return await res.json();
}
</script>
```

### Notes

- Embedding model: `text-embedding-3-small`.
- Default chunking: ~300 tokens size with ~50 overlap (word-based approximation).
- Files stored temporarily in `tmp/uploads` during processing.
- Results contain raw chunk text; you can feed top chunks to your chat model for answer synthesis.
