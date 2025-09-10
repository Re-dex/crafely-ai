import { prisma } from "../database/prisma";
import { OpenAiService } from "./openai.service";
import pdfParse from "pdf-parse";
import fs from "fs";

type CreateDocumentInput = {
  userId: string;
  filePath: string;
  filename?: string;
  mimeType?: string;
  title?: string;
  chunkSize?: number;
  chunkOverlap?: number;
};

type QueryInput = {
  userId: string;
  query: string;
  topK?: number;
};

export class RagService {
  private openai: OpenAiService;

  constructor(openaiService = new OpenAiService()) {
    this.openai = openaiService;
  }

  private chunkText(text: string, size: number, overlap: number) {
    const chunks: { content: string; index: number }[] = [];
    const words = text.split(/\s+/);
    let start = 0;
    let index = 0;
    while (start < words.length) {
      const end = Math.min(start + size, words.length);
      const content = words.slice(start, end).join(" ");
      chunks.push({ content, index });
      index += 1;
      if (end === words.length) break;
      start = end - overlap;
      if (start < 0) start = 0;
    }
    return chunks;
  }

  private async embedTexts(texts: string[]): Promise<number[][]> {
    const sdk: any = (this.openai as any).sdk;
    const response = await sdk.embeddings.create({
      model: "text-embedding-3-small",
      input: texts,
    });
    return response.data.map((d: any) => d.embedding as number[]);
  }

  async createDocument(input: CreateDocumentInput) {
    const { userId, filePath, filename, mimeType, title } = input;
    const chunkSize = input.chunkSize ?? 300;
    const chunkOverlap = input.chunkOverlap ?? 50;

    const buffer = fs.readFileSync(filePath);
    const parsed = await pdfParse(buffer);
    const text = parsed.text || "";

    const chunks = this.chunkText(text, chunkSize, chunkOverlap);
    const embeddings = await this.embedTexts(chunks.map((c) => c.content));

    const document = await prisma.document.create({
      data: {
        userId,
        title: title ?? filename ?? "Untitled",
        filename,
        mimeType: mimeType ?? "application/pdf",
        sizeBytes: buffer.length,
      },
    });

    await prisma.$transaction(
      chunks.map((chunk, i) =>
        prisma.documentChunk.create({
          data: {
            documentId: document.id,
            userId,
            index: chunk.index,
            content: chunk.content,
            embedding: embeddings[i] as unknown as any,
          },
        })
      )
    );

    return document;
  }

  private async embedQuery(query: string): Promise<number[]> {
    const sdk: any = (this.openai as any).sdk;
    const response = await sdk.embeddings.create({
      model: "text-embedding-3-small",
      input: [query],
    });
    return response.data[0].embedding as number[];
  }

  async query(input: QueryInput) {
    const { userId, query, topK = 5 } = input;
    const queryEmbedding = await this.embedQuery(query);

    const candidates = await prisma.documentChunk.findMany({
      where: { userId },
      select: {
        id: true,
        documentId: true,
        index: true,
        content: true,
        embedding: true,
      },
      take: Math.max(topK * 20, 100),
      orderBy: { createdAt: "desc" },
    });

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

    const scored = candidates.map((c) => ({
      ...c,
      similarity: similarity(
        queryEmbedding,
        (c.embedding as unknown as number[]) || []
      ),
    }));

    scored.sort((a, b) => b.similarity - a.similarity);
    return scored.slice(0, topK);
  }
}
