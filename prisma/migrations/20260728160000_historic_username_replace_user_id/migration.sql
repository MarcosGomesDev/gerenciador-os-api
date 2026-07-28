-- AlterTable
ALTER TABLE "historics" ADD COLUMN "username" TEXT;

-- Backfill username from related user name
UPDATE "historics" AS h
SET "username" = u."name"
FROM "users" AS u
WHERE h."user_id" = u."id";

-- DropForeignKey
ALTER TABLE "historics" DROP CONSTRAINT "historics_user_id_fkey";

-- AlterTable
ALTER TABLE "historics" DROP COLUMN "user_id";
