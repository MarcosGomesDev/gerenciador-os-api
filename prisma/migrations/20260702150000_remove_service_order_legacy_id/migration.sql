-- DropIndex
DROP INDEX IF EXISTS "service_order_legacy_id_key";

-- AlterTable
ALTER TABLE "service_order" DROP COLUMN IF EXISTS "legacy_id";
