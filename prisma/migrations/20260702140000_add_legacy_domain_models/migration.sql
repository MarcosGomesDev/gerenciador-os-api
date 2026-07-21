-- CreateEnum
CREATE TYPE "PatrimonySituation" AS ENUM ('ACTIVE', 'INACTIVE', 'MAINTENANCE');

-- AlterEnum
ALTER TYPE "OrderStatus" ADD VALUE 'IN_LABORATORY';
ALTER TYPE "OrderStatus" ADD VALUE 'CANCELLED';

-- AlterTable
ALTER TABLE "users" ADD COLUMN "legacy_id" INTEGER,
ADD COLUMN "location_id" TEXT,
ADD COLUMN "phone" TEXT,
ADD COLUMN "mobile" TEXT,
ADD COLUMN "extension" TEXT,
ADD COLUMN "photo" TEXT;

-- AlterTable
ALTER TABLE "service_order" ADD COLUMN "legacy_id" INTEGER,
ADD COLUMN "patrimony_id" TEXT,
ADD COLUMN "reported_issue_id" TEXT,
ADD COLUMN "is_external" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "contact_name" TEXT,
ADD COLUMN "contact_phone" TEXT,
ADD COLUMN "service_rating" INTEGER,
ADD COLUMN "rated_at" TIMESTAMP(3),
ADD COLUMN "closed_at" TIMESTAMP(3),
ADD COLUMN "closed_by_id" TEXT,
ADD COLUMN "lab_entry_at" TIMESTAMP(3),
ADD COLUMN "lab_exit_at" TIMESTAMP(3),
ADD COLUMN "lab_description" TEXT,
ADD COLUMN "lab_technician_id" TEXT;

-- CreateTable
CREATE TABLE "location_types" (
    "id" TEXT NOT NULL,
    "legacy_id" INTEGER,
    "name" TEXT NOT NULL,

    CONSTRAINT "location_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "locations" (
    "id" TEXT NOT NULL,
    "legacy_id" INTEGER,
    "name" TEXT NOT NULL,
    "address" TEXT,
    "directorate" TEXT,
    "phone" TEXT,
    "mobile" TEXT,
    "department" "Department" NOT NULL,
    "location_type_id" TEXT NOT NULL,

    CONSTRAINT "locations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "patrimony_types" (
    "id" TEXT NOT NULL,
    "legacy_id" INTEGER,
    "name" TEXT NOT NULL,

    CONSTRAINT "patrimony_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "patrimonies" (
    "id" TEXT NOT NULL,
    "legacy_id" INTEGER,
    "inventory_number" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "situation" "PatrimonySituation" NOT NULL,
    "location_name" TEXT,
    "department" "Department" NOT NULL,
    "location_id" TEXT NOT NULL,
    "patrimony_type_id" TEXT NOT NULL,
    "created_by_id" TEXT,
    "updated_by_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "patrimonies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reported_issues" (
    "id" TEXT NOT NULL,
    "legacy_id" INTEGER,
    "name" TEXT NOT NULL,

    CONSTRAINT "reported_issues_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "location_types_legacy_id_key" ON "location_types"("legacy_id");

-- CreateIndex
CREATE UNIQUE INDEX "locations_legacy_id_key" ON "locations"("legacy_id");

-- CreateIndex
CREATE UNIQUE INDEX "patrimony_types_legacy_id_key" ON "patrimony_types"("legacy_id");

-- CreateIndex
CREATE UNIQUE INDEX "patrimonies_legacy_id_key" ON "patrimonies"("legacy_id");

-- CreateIndex
CREATE UNIQUE INDEX "reported_issues_legacy_id_key" ON "reported_issues"("legacy_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_legacy_id_key" ON "users"("legacy_id");

-- CreateIndex
CREATE UNIQUE INDEX "service_order_legacy_id_key" ON "service_order"("legacy_id");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "locations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "locations" ADD CONSTRAINT "locations_location_type_id_fkey" FOREIGN KEY ("location_type_id") REFERENCES "location_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "patrimonies" ADD CONSTRAINT "patrimonies_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "locations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "patrimonies" ADD CONSTRAINT "patrimonies_patrimony_type_id_fkey" FOREIGN KEY ("patrimony_type_id") REFERENCES "patrimony_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "patrimonies" ADD CONSTRAINT "patrimonies_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "patrimonies" ADD CONSTRAINT "patrimonies_updated_by_id_fkey" FOREIGN KEY ("updated_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_order" ADD CONSTRAINT "service_order_patrimony_id_fkey" FOREIGN KEY ("patrimony_id") REFERENCES "patrimonies"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_order" ADD CONSTRAINT "service_order_reported_issue_id_fkey" FOREIGN KEY ("reported_issue_id") REFERENCES "reported_issues"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_order" ADD CONSTRAINT "service_order_closed_by_id_fkey" FOREIGN KEY ("closed_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_order" ADD CONSTRAINT "service_order_lab_technician_id_fkey" FOREIGN KEY ("lab_technician_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
