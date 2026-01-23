-- CreateEnum
CREATE TYPE "AuthProvider" AS ENUM ('GOOGLE', 'FACEBOOK', 'LOCAL');

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'MODERATOR', 'MEMBER', 'USER');

-- CreateEnum
CREATE TYPE "Action" AS ENUM ('CREATE', 'READ', 'UPDATE', 'DELETE', 'MANAGE');

-- CreateEnum
CREATE TYPE "Scope" AS ENUM ('OWN', 'ANY');

-- CreateEnum
CREATE TYPE "Subject" AS ENUM ('BAG', 'ITEM', 'SUITCASE', 'USER', 'ROLE', 'PERMISSION');

-- CreateEnum
CREATE TYPE "TokenType" AS ENUM ('EMAIL_VERIFICATION', 'PASSWORD_RESET', 'CHANGE_EMAIL', 'TWO_FACTOR');

-- CreateEnum
CREATE TYPE "Material" AS ENUM ('LEATHER', 'SYNTHETIC', 'FABRIC', 'POLYESTER', 'NYLON', 'CANVAS', 'HARD_SHELL', 'METAL');

-- CreateEnum
CREATE TYPE "ItemCategory" AS ENUM ('ELECTRONICS', 'ACCESSORIES', 'FURNITURE', 'MEDICINE', 'CLOTHING', 'BOOKS', 'FOOD', 'TOILETRIES', 'DOCUMENTS', 'SPORTS');

-- CreateEnum
CREATE TYPE "BagType" AS ENUM ('BACKPACK', 'DUFFEL', 'TOTE', 'MESSENGER', 'LAPTOP_BAG', 'TRAVEL_BAG', 'HANDBAG', 'CROSSBODY', 'SHOULDER_BAG');

-- CreateEnum
CREATE TYPE "SuitcaseType" AS ENUM ('CARRY_ON', 'CHECKED_LUGGAGE', 'HARD_SHELL', 'SOFT_SHELL', 'BUSINESS', 'KIDS', 'EXPANDABLE');

-- CreateEnum
CREATE TYPE "SuitcaseFeature" AS ENUM ('TSA_LOCK', 'WATERPROOF', 'EXPANDABLE', 'USB_PORT', 'LIGHTWEIGHT', 'ANTI_THEFT', 'SCRATCH_RESISTANT', 'COMPRESSION_STRAPS', 'TELESCOPIC_HANDLE', 'SPINNER_WHEELS');

-- CreateEnum
CREATE TYPE "BagFeature" AS ENUM ('WATERPROOF', 'PADDED_LAPTOP_COMPARTMENT', 'USB_PORT', 'ANTI_THEFT', 'MULTIPLE_POCKETS', 'LIGHTWEIGHT', 'EXPANDABLE', 'REINFORCED_STRAPS', 'TROLLEY_SLEEVE', 'HIDDEN_POCKET', 'RFID_BLOCKING');

-- CreateEnum
CREATE TYPE "Size" AS ENUM ('SMALL', 'MEDIUM', 'LARGE', 'EXTRA_LARGE');

-- CreateEnum
CREATE TYPE "WheelType" AS ENUM ('NONE', 'TWO_WHEEL', 'FOUR_WHEEL', 'SPINNER');

-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE', 'OTHER');

-- CreateEnum
CREATE TYPE "WeightUnit" AS ENUM ('GRAM', 'KILOGRAM', 'POUND', 'OUNCE');

-- CreateEnum
CREATE TYPE "VolumeUnit" AS ENUM ('ML', 'LITER', 'CU_CM', 'CU_IN');

-- CreateTable
CREATE TABLE "accounts" (
    "id" TEXT NOT NULL,
    "authProvider" "AuthProvider" NOT NULL,
    "provider_id" TEXT,
    "hashedPassword" TEXT,
    "password_change_at" TIMESTAMP(3),
    "user_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bags" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "BagType" NOT NULL,
    "color" TEXT DEFAULT 'black',
    "size" "Size" NOT NULL,
    "maxCapacity" DOUBLE PRECISION NOT NULL,
    "maxWeight" DOUBLE PRECISION NOT NULL,
    "bagWeight" DOUBLE PRECISION NOT NULL,
    "material" "Material",
    "features" "BagFeature"[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "user_id" TEXT,

    CONSTRAINT "bags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bag_items" (
    "bag_id" TEXT NOT NULL,
    "item_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bag_items_pkey" PRIMARY KEY ("bag_id","item_id")
);

-- CreateTable
CREATE TABLE "items" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" "ItemCategory" NOT NULL,
    "quantity" INTEGER NOT NULL,
    "weight" DOUBLE PRECISION NOT NULL,
    "weightUnit" "WeightUnit" NOT NULL DEFAULT 'KILOGRAM',
    "volume" DOUBLE PRECISION NOT NULL,
    "volumeUnit" "VolumeUnit" NOT NULL DEFAULT 'LITER',
    "color" TEXT DEFAULT 'black',
    "is_fragile" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "user_id" TEXT,

    CONSTRAINT "items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "profiles" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "avatarUrl" TEXT,
    "gender" "Gender",
    "birthDate" TIMESTAMP(3),
    "country" TEXT,
    "city" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "suitcases" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "brand" TEXT,
    "type" "SuitcaseType" NOT NULL,
    "color" TEXT DEFAULT 'black',
    "size" "Size" NOT NULL,
    "maxCapacity" DOUBLE PRECISION NOT NULL,
    "maxWeight" DOUBLE PRECISION NOT NULL,
    "suitcaseWeight" DOUBLE PRECISION NOT NULL,
    "material" "Material",
    "features" "SuitcaseFeature"[],
    "wheels" "WheelType",
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "user_id" TEXT,

    CONSTRAINT "suitcases_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "suitcase_items" (
    "suitcase_id" TEXT NOT NULL,
    "item_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "suitcase_items_pkey" PRIMARY KEY ("suitcase_id","item_id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'USER',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_email_verified" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_tokens" (
    "id" TEXT NOT NULL,
    "type" "TokenType" NOT NULL,
    "hashToken" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,

    CONSTRAINT "user_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "permissions" (
    "id" TEXT NOT NULL,
    "action" "Action" NOT NULL,
    "scope" "Scope" NOT NULL,
    "subject" "Subject" NOT NULL,

    CONSTRAINT "permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "role_on_permissions" (
    "id" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "permissionId" TEXT NOT NULL,

    CONSTRAINT "role_on_permissions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "accounts_provider_id_key" ON "accounts"("provider_id");

-- CreateIndex
CREATE UNIQUE INDEX "accounts_user_id_key" ON "accounts"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "profiles_user_id_key" ON "profiles"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "user_tokens_hashToken_key" ON "user_tokens"("hashToken");

-- CreateIndex
CREATE UNIQUE INDEX "permissions_action_scope_subject_key" ON "permissions"("action", "scope", "subject");

-- CreateIndex
CREATE UNIQUE INDEX "role_on_permissions_role_permissionId_key" ON "role_on_permissions"("role", "permissionId");

-- AddForeignKey
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bags" ADD CONSTRAINT "bags_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bag_items" ADD CONSTRAINT "bag_items_bag_id_fkey" FOREIGN KEY ("bag_id") REFERENCES "bags"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bag_items" ADD CONSTRAINT "bag_items_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "items" ADD CONSTRAINT "items_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "suitcases" ADD CONSTRAINT "suitcases_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "suitcase_items" ADD CONSTRAINT "suitcase_items_suitcase_id_fkey" FOREIGN KEY ("suitcase_id") REFERENCES "suitcases"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "suitcase_items" ADD CONSTRAINT "suitcase_items_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_tokens" ADD CONSTRAINT "user_tokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_on_permissions" ADD CONSTRAINT "role_on_permissions_permissionId_fkey" FOREIGN KEY ("permissionId") REFERENCES "permissions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
