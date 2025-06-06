-- CreateTable
CREATE TABLE "ApiKey" (
    "id" TEXT NOT NULL,
    "keyId" TEXT NOT NULL,
    "hashedKey" TEXT NOT NULL,
    "name" TEXT,
    "prefix" TEXT,
    "permissions" TEXT[],
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lastUsedAt" TIMESTAMP(3),
    "userId" INTEGER NOT NULL,

    CONSTRAINT "ApiKey_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ApiKey_keyId_key" ON "ApiKey"("keyId");

-- CreateIndex
CREATE INDEX "ApiKey_userId_active_idx" ON "ApiKey"("userId", "active");

-- CreateIndex
CREATE INDEX "ApiKey_keyId_idx" ON "ApiKey"("keyId");

-- AddForeignKey
ALTER TABLE "ApiKey" ADD CONSTRAINT "ApiKey_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
