-- AlterTable
ALTER TABLE "Document" ADD COLUMN     "threadId" TEXT;

-- CreateIndex
CREATE INDEX "Document_threadId_createdAt_idx" ON "Document"("threadId", "createdAt");
