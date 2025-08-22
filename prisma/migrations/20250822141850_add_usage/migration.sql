-- CreateTable
CREATE TABLE "Usage" (
    "id" VARCHAR(255) NOT NULL DEFAULT concat('use_', gen_random_uuid()),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "apiKeyId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "provider" TEXT,
    "model" TEXT,
    "type" TEXT,
    "tokensIn" INTEGER,
    "tokensOut" INTEGER,
    "tokensTotal" INTEGER,
    "cost" DECIMAL(10,6),
    "currency" TEXT DEFAULT 'usd',
    "metadata" JSONB,

    CONSTRAINT "Usage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Usage_apiKeyId_createdAt_idx" ON "Usage"("apiKeyId", "createdAt");

-- CreateIndex
CREATE INDEX "Usage_userId_createdAt_idx" ON "Usage"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "Usage_provider_model_idx" ON "Usage"("provider", "model");

-- AddForeignKey
ALTER TABLE "Usage" ADD CONSTRAINT "Usage_apiKeyId_fkey" FOREIGN KEY ("apiKeyId") REFERENCES "ApiKey"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
