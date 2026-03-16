/*
  Warnings:

  - Added the required column `status` to the `service_order` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "service_order" ADD COLUMN     "status" "OrderStatus" NOT NULL;
