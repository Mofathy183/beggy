/*
  Warnings:

  - You are about to drop the column `bagWeight` on the `bags` table. All the data in the column will be lost.
  - You are about to drop the column `maxCapacity` on the `bags` table. All the data in the column will be lost.
  - You are about to drop the column `maxWeight` on the `bags` table. All the data in the column will be lost.
  - You are about to drop the column `quantity` on the `items` table. All the data in the column will be lost.
  - You are about to drop the column `maxCapacity` on the `suitcases` table. All the data in the column will be lost.
  - You are about to drop the column `maxWeight` on the `suitcases` table. All the data in the column will be lost.
  - You are about to drop the column `suitcaseWeight` on the `suitcases` table. All the data in the column will be lost.
  - You are about to drop the `bag_items` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `suitcase_items` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[container_id]` on the table `bags` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[container_id]` on the table `suitcases` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `container_id` to the `bags` table without a default value. This is not possible if the table is not empty.
  - Added the required column `container_id` to the `suitcases` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ContainerType" AS ENUM ('BAG', 'SUITCASE');

-- DropForeignKey
ALTER TABLE "accounts" DROP CONSTRAINT "accounts_user_id_fkey";

-- DropForeignKey
ALTER TABLE "bag_items" DROP CONSTRAINT "bag_items_bag_id_fkey";

-- DropForeignKey
ALTER TABLE "bag_items" DROP CONSTRAINT "bag_items_item_id_fkey";

-- DropForeignKey
ALTER TABLE "profiles" DROP CONSTRAINT "profiles_user_id_fkey";

-- DropForeignKey
ALTER TABLE "suitcase_items" DROP CONSTRAINT "suitcase_items_item_id_fkey";

-- DropForeignKey
ALTER TABLE "suitcase_items" DROP CONSTRAINT "suitcase_items_suitcase_id_fkey";

-- AlterTable
ALTER TABLE "bags" DROP COLUMN "bagWeight",
DROP COLUMN "maxCapacity",
DROP COLUMN "maxWeight",
ADD COLUMN     "container_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "items" DROP COLUMN "quantity";

-- AlterTable
ALTER TABLE "suitcases" DROP COLUMN "maxCapacity",
DROP COLUMN "maxWeight",
DROP COLUMN "suitcaseWeight",
ADD COLUMN     "container_id" TEXT NOT NULL;

-- DropTable
DROP TABLE "bag_items";

-- DropTable
DROP TABLE "suitcase_items";

-- CreateTable
CREATE TABLE "containers" (
    "id" TEXT NOT NULL,
    "type" "ContainerType" NOT NULL,
    "maxCapacity" DOUBLE PRECISION NOT NULL,
    "maxWeight" DOUBLE PRECISION NOT NULL,
    "emptyWeight" DOUBLE PRECISION NOT NULL,
    "userId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "containers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "container_items" (
    "containerId" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "container_items_pkey" PRIMARY KEY ("containerId","itemId")
);

-- CreateIndex
CREATE UNIQUE INDEX "bags_container_id_key" ON "bags"("container_id");

-- CreateIndex
CREATE UNIQUE INDEX "suitcases_container_id_key" ON "suitcases"("container_id");

-- AddForeignKey
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bags" ADD CONSTRAINT "bags_container_id_fkey" FOREIGN KEY ("container_id") REFERENCES "containers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "containers" ADD CONSTRAINT "containers_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "container_items" ADD CONSTRAINT "container_items_containerId_fkey" FOREIGN KEY ("containerId") REFERENCES "containers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "container_items" ADD CONSTRAINT "container_items_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "suitcases" ADD CONSTRAINT "suitcases_container_id_fkey" FOREIGN KEY ("container_id") REFERENCES "containers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
