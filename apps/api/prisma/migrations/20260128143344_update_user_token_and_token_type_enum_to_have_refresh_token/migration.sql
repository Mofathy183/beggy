/*
  Warnings:

  - The values [TWO_FACTOR] on the enum `TokenType` will be removed. If these variants are still used in the database, this will fail.
  - You are about to alter the column `hashToken` on the `user_tokens` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(255)`.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "TokenType_new" AS ENUM ('REFRESH', 'EMAIL_VERIFICATION', 'PASSWORD_RESET', 'CHANGE_EMAIL');
ALTER TABLE "user_tokens" ALTER COLUMN "type" TYPE "TokenType_new" USING ("type"::text::"TokenType_new");
ALTER TYPE "TokenType" RENAME TO "TokenType_old";
ALTER TYPE "TokenType_new" RENAME TO "TokenType";
DROP TYPE "public"."TokenType_old";
COMMIT;

-- AlterTable
ALTER TABLE "user_tokens" ADD COLUMN     "lastUsedAt" TIMESTAMP(3),
ALTER COLUMN "hashToken" SET DATA TYPE VARCHAR(255);
