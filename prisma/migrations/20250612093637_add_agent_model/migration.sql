-- AlterTable
ALTER TABLE "Thread" ADD COLUMN     "agentId" TEXT;

-- CreateTable
CREATE TABLE "Agent" (
    "id" VARCHAR(255) NOT NULL DEFAULT concat('agnt_', gen_random_uuid()),
    "name" TEXT NOT NULL,
    "instructions" TEXT NOT NULL,
    "tools" TEXT NOT NULL,
    "context" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Agent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Agent_name_idx" ON "Agent"("name");

-- CreateIndex
CREATE INDEX "Thread_agentId_idx" ON "Thread"("agentId");

-- AddForeignKey
ALTER TABLE "Thread" ADD CONSTRAINT "Thread_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "Agent"("id") ON DELETE SET NULL ON UPDATE CASCADE;
