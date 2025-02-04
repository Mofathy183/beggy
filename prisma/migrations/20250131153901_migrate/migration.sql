/*
  Warnings:

  - You are about to drop the column `password_confirm` on the `users` table. All the data in the column will be lost.
  - Added the required column `confirm_password` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "users" DROP COLUMN "password_confirm",
ADD COLUMN     "confirm_password" BOOLEAN NOT NULL;
