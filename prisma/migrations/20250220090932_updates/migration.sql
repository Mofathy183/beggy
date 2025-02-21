/*
  Warnings:

  - The values [instagram] on the enum `Providers` will be removed. If these variants are still used in the database, this will fail.
  - The `material` column on the `bags` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `feeatures` column on the `bags` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the `suitecases` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `maxWeight` to the `bags` table without a default value. This is not possible if the table is not empty.
  - Made the column `user_id` on table `items` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "BagType" AS ENUM ('backpack', 'duffel', 'tote', 'messenger', 'laptop_bag', 'travel_bag', 'handbag', 'crossbody', 'shoulder_bag');

-- CreateEnum
CREATE TYPE "SuitcaseType" AS ENUM ('carry_on', 'checked_luggage', 'hard_shell', 'soft_shell', 'business', 'kids', 'expandable');

-- CreateEnum
CREATE TYPE "SuitcaseFeature" AS ENUM ('none', 'tsa_lock', 'waterproof', 'expandable', 'usb_port', 'lightweight', 'anti_theft', 'scratch_resistant', 'spinner_wheels', 'compression_straps', 'telescopic_handle');

-- CreateEnum
CREATE TYPE "BagFeature" AS ENUM ('none', 'waterproof', 'padded_laptop_compartment', 'usb_port', 'anti_theft', 'multiple_pockets', 'lightweight', 'expandable', 'reinforced_straps', 'trolley_sleeve', 'hidden_pocket');

-- CreateEnum
CREATE TYPE "WheelType" AS ENUM ('0', '2', '4', '3');

-- AlterEnum
ALTER TYPE "Gender" ADD VALUE 'other';

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "Material" ADD VALUE 'polyester';
ALTER TYPE "Material" ADD VALUE 'nylo';
ALTER TYPE "Material" ADD VALUE 'canvas';
ALTER TYPE "Material" ADD VALUE 'hard_shell';
ALTER TYPE "Material" ADD VALUE 'metal';

-- AlterEnum
BEGIN;
CREATE TYPE "Providers_new" AS ENUM ('google', 'facebook');
ALTER TABLE "accounts" ALTER COLUMN "provider" TYPE "Providers_new" USING ("provider"::text::"Providers_new");
ALTER TYPE "Providers" RENAME TO "Providers_old";
ALTER TYPE "Providers_new" RENAME TO "Providers";
DROP TYPE "Providers_old";
COMMIT;

-- AlterEnum
ALTER TYPE "Size" ADD VALUE 'extra_large';

-- DropForeignKey
ALTER TABLE "items" DROP CONSTRAINT "items_suitcase_id_fkey";

-- DropForeignKey
ALTER TABLE "items" DROP CONSTRAINT "items_user_id_fkey";

-- DropForeignKey
ALTER TABLE "suitecases" DROP CONSTRAINT "suitecases_user_id_fkey";

-- AlterTable
ALTER TABLE "bags" ADD COLUMN     "maxWeight" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "minWeight" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
DROP COLUMN "material",
ADD COLUMN     "material" "Material",
DROP COLUMN "feeatures",
ADD COLUMN     "feeatures" "BagFeature"[];

-- AlterTable
ALTER TABLE "items" ADD COLUMN     "color" TEXT,
ALTER COLUMN "user_id" SET NOT NULL;

-- DropTable
DROP TABLE "suitecases";

-- CreateTable
CREATE TABLE "suitcases" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "brand" TEXT,
    "color" TEXT NOT NULL,
    "size" "Size" NOT NULL,
    "capacity" DOUBLE PRECISION NOT NULL,
    "maxWidth" DOUBLE PRECISION NOT NULL,
    "weight" DOUBLE PRECISION NOT NULL,
    "minWidth" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "material" "Material",
    "features" "SuitcaseFeature"[],
    "wheels" "WheelType",
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "user_id" TEXT NOT NULL,

    CONSTRAINT "suitcases_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "items" ADD CONSTRAINT "items_suitcase_id_fkey" FOREIGN KEY ("suitcase_id") REFERENCES "suitcases"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "items" ADD CONSTRAINT "items_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "suitcases" ADD CONSTRAINT "suitcases_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
