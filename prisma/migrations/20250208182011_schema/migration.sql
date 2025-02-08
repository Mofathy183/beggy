-- CreateEnum
CREATE TYPE "Role" AS ENUM ('admin', 'member', 'subscriber', 'user');

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "role" "Role" NOT NULL DEFAULT 'user';
