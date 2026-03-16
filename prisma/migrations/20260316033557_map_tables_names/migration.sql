/*
  Warnings:

  - You are about to drop the `ServiceOrder` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ServiceOrderStatus` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "ServiceOrder" DROP CONSTRAINT "ServiceOrder_userId_fkey";

-- DropForeignKey
ALTER TABLE "ServiceOrderStatus" DROP CONSTRAINT "ServiceOrderStatus_service_order_id_fkey";

-- DropForeignKey
ALTER TABLE "ServiceOrderStatus" DROP CONSTRAINT "ServiceOrderStatus_technician_id_fkey";

-- DropTable
DROP TABLE "ServiceOrder";

-- DropTable
DROP TABLE "ServiceOrderStatus";

-- CreateTable
CREATE TABLE "service_order" (
    "id" TEXT NOT NULL,
    "order_id" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "type" "ServiceOrderType" NOT NULL,
    "department" "Department" NOT NULL,
    "requester" TEXT NOT NULL,
    "priority" "OrderPriority" NOT NULL,
    "attachment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT,

    CONSTRAINT "service_order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "service_order_status" (
    "id" TEXT NOT NULL,
    "service_order_id" TEXT NOT NULL,
    "status" "OrderStatus" NOT NULL,
    "note" TEXT,
    "technician_id" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "service_order_status_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "service_order_order_id_key" ON "service_order"("order_id");

-- AddForeignKey
ALTER TABLE "service_order" ADD CONSTRAINT "service_order_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_order_status" ADD CONSTRAINT "service_order_status_service_order_id_fkey" FOREIGN KEY ("service_order_id") REFERENCES "service_order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_order_status" ADD CONSTRAINT "service_order_status_technician_id_fkey" FOREIGN KEY ("technician_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
