/*
  Warnings:

  - You are about to drop the column `username` on the `users` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "users_username_key";

-- AlterTable
ALTER TABLE "users" DROP COLUMN "username",
ADD COLUMN     "passwoed_reset_at" TIMESTAMP(3),
ADD COLUMN     "password_change_at" TIMESTAMP(3),
ADD COLUMN     "password_reset_token" TEXT;
