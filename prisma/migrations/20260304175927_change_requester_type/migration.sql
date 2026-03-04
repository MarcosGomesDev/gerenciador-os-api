/*
  Warnings:

  - You are about to drop the column `requester_id` on the `ServiceOrder` table. All the data in the column will be lost.
  - Added the required column `requester` to the `ServiceOrder` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "ServiceOrder" DROP CONSTRAINT "ServiceOrder_requester_id_fkey";

-- AlterTable
ALTER TABLE "ServiceOrder" DROP COLUMN "requester_id",
ADD COLUMN     "requester" TEXT NOT NULL,
ADD COLUMN     "userId" TEXT;

-- AddForeignKey
ALTER TABLE "ServiceOrder" ADD CONSTRAINT "ServiceOrder_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
