## RAG API Usage

Simple Retrieval-Augmented Generation utilities for uploading PDFs, storing chunk embeddings, and querying relevant chunks. Embeddings use `text-embedding-3-small` and are stored in Prisma as `Float[]`.

### Prerequisites

- **Auth**: Use your existing API Key system. Send `Authorization: Bearer <API_KEY>`.
- **Env**: `OPENAI_API_KEY` and `DATABASE_URL` configured.
- **Server**: App running (default `http://localhost:4000`).

### Endpoints

- POST `/api/v1/rag/upload` — Upload a PDF, chunk, embed, and store.
- POST `/api/v1/rag/query` — Query and retrieve top similar chunks.

### Upload PDF

- Content-Type: `multipart/form-data`
- Field name: `file`
- Only PDF (`application/pdf`), up to 20MB.

Example (curl):

```bash
curl -X POST \
  'http://localhost:4000/api/v1/rag/upload' \
  -H 'Authorization: Bearer <API_KEY>' \
  -F 'file=@/absolute/path/to/document.pdf'
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
  -d '{"query":"what does the contract say about termination?","topK":5}'
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

### JS (ES6) Usage

```js
const API_KEY = "Bearer <API_KEY>";
const BASE = "http://localhost:4000/api/v1/rag";

export async function uploadPdf(file) {
  const form = new FormData();
  form.append("file", file);
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
</script>
```

### Notes

- Embedding model: `text-embedding-3-small`.
- Default chunking: ~300 tokens size with ~50 overlap (word-based approximation).
- Files stored temporarily in `tmp/uploads` during processing.
- Results contain raw chunk text; you can feed top chunks to your chat model for answer synthesis.
