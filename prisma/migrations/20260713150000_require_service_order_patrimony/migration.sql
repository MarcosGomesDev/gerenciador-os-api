-- Delete orphan service orders without patrimony (should be none after legacy import)
DELETE FROM "service_order" WHERE "patrimony_id" IS NULL;

-- AlterTable
ALTER TABLE "service_order" ALTER COLUMN "patrimony_id" SET NOT NULL;
