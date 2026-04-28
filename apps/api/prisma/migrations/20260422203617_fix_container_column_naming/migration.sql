/*
  Warnings:

  - The primary key for the `container_items` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `containerId` on the `container_items` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `container_items` table. All the data in the column will be lost.
  - You are about to drop the column `itemId` on the `container_items` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `container_items` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `containers` table. All the data in the column will be lost.
  - You are about to drop the column `emptyWeight` on the `containers` table. All the data in the column will be lost.
  - You are about to drop the column `maxCapacity` on the `containers` table. All the data in the column will be lost.
  - You are about to drop the column `maxWeight` on the `containers` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `containers` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `containers` table. All the data in the column will be lost.
  - Added the required column `container_id` to the `container_items` table without a default value. This is not possible if the table is not empty.
  - Added the required column `item_id` to the `container_items` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `container_items` table without a default value. This is not possible if the table is not empty.
  - Added the required column `max_capacity` to the `containers` table without a default value. This is not possible if the table is not empty.
  - Added the required column `max_weight` to the `containers` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `containers` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "container_items" DROP CONSTRAINT "container_items_containerId_fkey";

-- DropForeignKey
ALTER TABLE "container_items" DROP CONSTRAINT "container_items_itemId_fkey";

-- DropForeignKey
ALTER TABLE "containers" DROP CONSTRAINT "containers_userId_fkey";

-- AlterTable
ALTER TABLE "container_items" DROP CONSTRAINT "container_items_pkey",
DROP COLUMN "containerId",
DROP COLUMN "createdAt",
DROP COLUMN "itemId",
DROP COLUMN "updatedAt",
ADD COLUMN     "container_id" TEXT NOT NULL,
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "item_id" TEXT NOT NULL,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL,
ADD CONSTRAINT "container_items_pkey" PRIMARY KEY ("container_id", "item_id");

-- AlterTable
ALTER TABLE "containers" DROP COLUMN "createdAt",
DROP COLUMN "emptyWeight",
DROP COLUMN "maxCapacity",
DROP COLUMN "maxWeight",
DROP COLUMN "updatedAt",
DROP COLUMN "userId",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "empty_weight" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "max_capacity" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "max_weight" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "user_id" TEXT;

-- AddForeignKey
ALTER TABLE "containers" ADD CONSTRAINT "containers_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "container_items" ADD CONSTRAINT "container_items_container_id_fkey" FOREIGN KEY ("container_id") REFERENCES "containers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "container_items" ADD CONSTRAINT "container_items_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "items"("id") ON DELETE CASCADE ON UPDATE CASCADE;
