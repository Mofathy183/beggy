/*
  Warnings:

  - The values [MALE,FEMALE] on the enum `Gender` will be removed. If these variants are still used in the database, this will fail.
  - The values [LEATHER,SYNTHETIC,FABRIC] on the enum `Material` will be removed. If these variants are still used in the database, this will fail.
  - The values [GOOGLE,FACEBOOK,INSTAGRAM] on the enum `Providers` will be removed. If these variants are still used in the database, this will fail.
  - The values [SMALL,MEDIUM,LARGE] on the enum `Size` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `confirm_password` on the `users` table. All the data in the column will be lost.
  - Added the required column `updated_at` to the `accounts` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `bags` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `items` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `suitecases` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "Gender_new" AS ENUM ('male', 'female');
ALTER TABLE "users" ALTER COLUMN "gender" TYPE "Gender_new" USING ("gender"::text::"Gender_new");
ALTER TYPE "Gender" RENAME TO "Gender_old";
ALTER TYPE "Gender_new" RENAME TO "Gender";
DROP TYPE "Gender_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "Material_new" AS ENUM ('leather', 'synthetic', 'fabric');
ALTER TABLE "suitecases" ALTER COLUMN "material" TYPE "Material_new" USING ("material"::text::"Material_new");
ALTER TYPE "Material" RENAME TO "Material_old";
ALTER TYPE "Material_new" RENAME TO "Material";
DROP TYPE "Material_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "Providers_new" AS ENUM ('google', 'facebook', 'instagram');
ALTER TABLE "accounts" ALTER COLUMN "provider" TYPE "Providers_new" USING ("provider"::text::"Providers_new");
ALTER TYPE "Providers" RENAME TO "Providers_old";
ALTER TYPE "Providers_new" RENAME TO "Providers";
DROP TYPE "Providers_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "Size_new" AS ENUM ('small', 'medium', 'large');
ALTER TABLE "bags" ALTER COLUMN "size" TYPE "Size_new" USING ("size"::text::"Size_new");
ALTER TABLE "suitecases" ALTER COLUMN "size" TYPE "Size_new" USING ("size"::text::"Size_new");
ALTER TYPE "Size" RENAME TO "Size_old";
ALTER TYPE "Size_new" RENAME TO "Size";
DROP TYPE "Size_old";
COMMIT;

-- AlterTable
ALTER TABLE "accounts" ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "bags" ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "items" ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "suitecases" ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "users" DROP COLUMN "confirm_password",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "profilePicture" DROP NOT NULL,
ALTER COLUMN "profilePicture" SET DEFAULT 'public/profilePicture.webp';
