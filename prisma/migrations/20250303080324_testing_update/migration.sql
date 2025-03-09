/*
  Warnings:

  - You are about to drop the column `bag_id` on the `items` table. All the data in the column will be lost.
  - You are about to drop the column `suitcase_id` on the `items` table. All the data in the column will be lost.
  - Changed the type of `type` on the `bags` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `type` on the `suitcases` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropForeignKey
ALTER TABLE "items" DROP CONSTRAINT "items_bag_id_fkey";

-- DropForeignKey
ALTER TABLE "items" DROP CONSTRAINT "items_suitcase_id_fkey";

-- AlterTable
ALTER TABLE "bags" DROP COLUMN "type",
ADD COLUMN     "type" "BagType" NOT NULL,
ALTER COLUMN "color" DROP NOT NULL,
ALTER COLUMN "color" SET DEFAULT 'black';

-- AlterTable
ALTER TABLE "items" DROP COLUMN "bag_id",
DROP COLUMN "suitcase_id",
ALTER COLUMN "color" SET DEFAULT 'black';

-- AlterTable
ALTER TABLE "suitcases" DROP COLUMN "type",
ADD COLUMN     "type" "SuitcaseType" NOT NULL,
ALTER COLUMN "color" DROP NOT NULL,
ALTER COLUMN "color" SET DEFAULT 'black';

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "city" TEXT;

-- CreateTable
CREATE TABLE "bag_items" (
    "bag_id" TEXT NOT NULL,
    "item_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bag_items_pkey" PRIMARY KEY ("bag_id","item_id")
);

-- CreateTable
CREATE TABLE "suitcase_items" (
    "suitcase_id" TEXT NOT NULL,
    "item_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "suitcase_items_pkey" PRIMARY KEY ("suitcase_id","item_id")
);

-- AddForeignKey
ALTER TABLE "bag_items" ADD CONSTRAINT "bag_items_bag_id_fkey" FOREIGN KEY ("bag_id") REFERENCES "bags"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bag_items" ADD CONSTRAINT "bag_items_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "suitcase_items" ADD CONSTRAINT "suitcase_items_suitcase_id_fkey" FOREIGN KEY ("suitcase_id") REFERENCES "suitcases"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "suitcase_items" ADD CONSTRAINT "suitcase_items_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "items"("id") ON DELETE CASCADE ON UPDATE CASCADE;
