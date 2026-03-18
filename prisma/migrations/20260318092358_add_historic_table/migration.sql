-- CreateEnum
CREATE TYPE "HistoricAction" AS ENUM ('CREATE', 'UPDATE', 'CLOSED', 'ATTRIBUTED');

-- CreateTable
CREATE TABLE "historics" (
    "id" TEXT NOT NULL,
    "detail" TEXT NOT NULL,
    "action" "HistoricAction" NOT NULL,
    "order_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user_id" TEXT,

    CONSTRAINT "historics_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "historics" ADD CONSTRAINT "historics_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "service_order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "historics" ADD CONSTRAINT "historics_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
