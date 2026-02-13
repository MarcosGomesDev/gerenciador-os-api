/*
  Warnings:

  - You are about to drop the column `userId` on the `ServiceOrder` table. All the data in the column will be lost.
  - Added the required column `requester_id` to the `ServiceOrder` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "ServiceOrder" DROP CONSTRAINT "ServiceOrder_userId_fkey";

-- AlterTable
ALTER TABLE "ServiceOrder" DROP COLUMN "userId",
ADD COLUMN     "requester_id" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "ServiceOrder" ADD CONSTRAINT "ServiceOrder_requester_id_fkey" FOREIGN KEY ("requester_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
