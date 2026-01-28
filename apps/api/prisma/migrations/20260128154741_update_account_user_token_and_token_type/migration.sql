/*
  Warnings:

  - The values [REFRESH] on the enum `TokenType` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `lastUsedAt` on the `user_tokens` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[user_id,authProvider]` on the table `accounts` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[authProvider,provider_id]` on the table `accounts` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "TokenType_new" AS ENUM ('EMAIL_VERIFICATION', 'PASSWORD_RESET', 'CHANGE_EMAIL');
ALTER TABLE "user_tokens" ALTER COLUMN "type" TYPE "TokenType_new" USING ("type"::text::"TokenType_new");
ALTER TYPE "TokenType" RENAME TO "TokenType_old";
ALTER TYPE "TokenType_new" RENAME TO "TokenType";
DROP TYPE "public"."TokenType_old";
COMMIT;

-- DropIndex
DROP INDEX "accounts_provider_id_key";

-- AlterTable
ALTER TABLE "user_tokens" DROP COLUMN "lastUsedAt";

-- CreateIndex
CREATE UNIQUE INDEX "accounts_user_id_authProvider_key" ON "accounts"("user_id", "authProvider");

-- CreateIndex
CREATE UNIQUE INDEX "accounts_authProvider_provider_id_key" ON "accounts"("authProvider", "provider_id");
