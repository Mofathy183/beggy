/*
  Warnings:

  - You are about to alter the column `name` on the `bags` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(100)`.
  - You are about to alter the column `color` on the `bags` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(50)`.
  - You are about to alter the column `name` on the `items` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(100)`.
  - You are about to alter the column `color` on the `items` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(50)`.
  - You are about to alter the column `first_name` on the `profiles` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(50)`.
  - You are about to alter the column `last_name` on the `profiles` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(50)`.
  - You are about to alter the column `avatarUrl` on the `profiles` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(2048)`.
  - You are about to alter the column `country` on the `profiles` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(100)`.
  - You are about to alter the column `city` on the `profiles` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(100)`.
  - You are about to alter the column `name` on the `suitcases` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(100)`.
  - You are about to alter the column `brand` on the `suitcases` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(100)`.
  - You are about to alter the column `color` on the `suitcases` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(50)`.
  - You are about to alter the column `email` on the `users` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(255)`.

*/
-- AlterTable
ALTER TABLE "bags" ALTER COLUMN "name" SET DATA TYPE VARCHAR(100),
ALTER COLUMN "color" SET DATA TYPE VARCHAR(50);

-- AlterTable
ALTER TABLE "items" ALTER COLUMN "name" SET DATA TYPE VARCHAR(100),
ALTER COLUMN "color" SET DATA TYPE VARCHAR(50);

-- AlterTable
ALTER TABLE "profiles" ALTER COLUMN "first_name" SET DATA TYPE VARCHAR(50),
ALTER COLUMN "last_name" SET DATA TYPE VARCHAR(50),
ALTER COLUMN "avatarUrl" SET DATA TYPE VARCHAR(2048),
ALTER COLUMN "country" SET DATA TYPE VARCHAR(100),
ALTER COLUMN "city" SET DATA TYPE VARCHAR(100);

-- AlterTable
ALTER TABLE "suitcases" ALTER COLUMN "name" SET DATA TYPE VARCHAR(100),
ALTER COLUMN "brand" SET DATA TYPE VARCHAR(100),
ALTER COLUMN "color" SET DATA TYPE VARCHAR(50);

-- AlterTable
ALTER TABLE "users" ALTER COLUMN "email" SET DATA TYPE VARCHAR(255);
