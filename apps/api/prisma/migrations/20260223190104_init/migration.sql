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
CREATE TYPE "TokenType" AS ENUM ('EMAIL_VERIFICATION', 'PASSWORD_RESET', 'CHANGE_EMAIL');

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
CREATE TYPE "ContainerType" AS ENUM ('BAG', 'SUITCASE');

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
    "container_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "BagType" NOT NULL,
    "color" TEXT DEFAULT 'black',
    "size" "Size" NOT NULL,
    "material" "Material",
    "features" "BagFeature"[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "user_id" TEXT,

    CONSTRAINT "bags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "containers" (
    "id" TEXT NOT NULL,
    "type" "ContainerType" NOT NULL,
    "maxCapacity" DOUBLE PRECISION NOT NULL,
    "maxWeight" DOUBLE PRECISION NOT NULL,
    "emptyWeight" DOUBLE PRECISION NOT NULL,
    "userId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "containers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "container_items" (
    "containerId" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "container_items_pkey" PRIMARY KEY ("containerId","itemId")
);

-- CreateTable
CREATE TABLE "items" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" "ItemCategory" NOT NULL,
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
    "container_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "brand" TEXT,
    "type" "SuitcaseType" NOT NULL,
    "color" TEXT DEFAULT 'black',
    "size" "Size" NOT NULL,
    "material" "Material",
    "features" "SuitcaseFeature"[],
    "wheels" "WheelType",
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "user_id" TEXT,

    CONSTRAINT "suitcases_pkey" PRIMARY KEY ("id")
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
    "hashToken" VARCHAR(255) NOT NULL,
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
CREATE UNIQUE INDEX "accounts_user_id_authProvider_key" ON "accounts"("user_id", "authProvider");

-- CreateIndex
CREATE UNIQUE INDEX "accounts_authProvider_provider_id_key" ON "accounts"("authProvider", "provider_id");

-- CreateIndex
CREATE UNIQUE INDEX "bags_container_id_key" ON "bags"("container_id");

-- CreateIndex
CREATE UNIQUE INDEX "profiles_user_id_key" ON "profiles"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "suitcases_container_id_key" ON "suitcases"("container_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "user_tokens_hashToken_key" ON "user_tokens"("hashToken");

-- CreateIndex
CREATE UNIQUE INDEX "permissions_action_scope_subject_key" ON "permissions"("action", "scope", "subject");

-- CreateIndex
CREATE UNIQUE INDEX "role_on_permissions_role_permissionId_key" ON "role_on_permissions"("role", "permissionId");

-- AddForeignKey
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bags" ADD CONSTRAINT "bags_container_id_fkey" FOREIGN KEY ("container_id") REFERENCES "containers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bags" ADD CONSTRAINT "bags_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "containers" ADD CONSTRAINT "containers_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "container_items" ADD CONSTRAINT "container_items_containerId_fkey" FOREIGN KEY ("containerId") REFERENCES "containers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "container_items" ADD CONSTRAINT "container_items_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "items" ADD CONSTRAINT "items_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "suitcases" ADD CONSTRAINT "suitcases_container_id_fkey" FOREIGN KEY ("container_id") REFERENCES "containers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "suitcases" ADD CONSTRAINT "suitcases_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_tokens" ADD CONSTRAINT "user_tokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_on_permissions" ADD CONSTRAINT "role_on_permissions_permissionId_fkey" FOREIGN KEY ("permissionId") REFERENCES "permissions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
