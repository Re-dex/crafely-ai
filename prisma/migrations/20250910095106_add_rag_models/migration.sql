-- CreateTable
CREATE TABLE "Document" (
    "id" VARCHAR(255) NOT NULL DEFAULT concat('doc_', gen_random_uuid()),
    "userId" TEXT NOT NULL,
    "title" TEXT,
    "filename" TEXT,
    "mimeType" TEXT DEFAULT 'application/pdf',
    "sizeBytes" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Document_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DocumentChunk" (
    "id" VARCHAR(255) NOT NULL DEFAULT concat('dchk_', gen_random_uuid()),
    "documentId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "index" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "embedding" DOUBLE PRECISION[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DocumentChunk_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Document_userId_createdAt_idx" ON "Document"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "DocumentChunk_documentId_index_idx" ON "DocumentChunk"("documentId", "index");

-- CreateIndex
CREATE INDEX "DocumentChunk_userId_createdAt_idx" ON "DocumentChunk"("userId", "createdAt");

-- AddForeignKey
ALTER TABLE "DocumentChunk" ADD CONSTRAINT "DocumentChunk_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "Document"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
