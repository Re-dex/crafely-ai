/*
  Warnings:

  - Added the required column `userId` to the `Agent` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Agent" ADD COLUMN     "userId" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "Agent_userId_idx" ON "Agent"("userId");

-- AddForeignKey
ALTER TABLE "Agent" ADD CONSTRAINT "Agent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
