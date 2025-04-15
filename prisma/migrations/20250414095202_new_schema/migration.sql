-- CreateEnum
CREATE TYPE "Material" AS ENUM ('leather', 'synthetic', 'fabric', 'polyester', 'nylon', 'canvas', 'hard_shell', 'metal');

-- CreateEnum
CREATE TYPE "ItemCategory" AS ENUM ('electronics', 'accessories', 'furniture', 'medicine', 'clothing', 'books', 'food');

-- CreateEnum
CREATE TYPE "BagType" AS ENUM ('backpack', 'duffel', 'tote', 'messenger', 'laptop_bag', 'travel_bag', 'handbag', 'crossbody', 'shoulder_bag');

-- CreateEnum
CREATE TYPE "SuitcaseType" AS ENUM ('carry_on', 'checked_luggage', 'hard_shell', 'soft_shell', 'business', 'kids', 'expandable');

-- CreateEnum
CREATE TYPE "SuitcaseFeature" AS ENUM ('none', 'tsa_lock', 'waterproof', 'expandable', 'usb_port', 'lightweight', 'anti_theft', 'scratch_resistant', 'compression_straps', 'telescopic_handle');

-- CreateEnum
CREATE TYPE "BagFeature" AS ENUM ('none', 'waterproof', 'padded_laptop_compartment', 'usb_port', 'anti_theft', 'multiple_pockets', 'lightweight', 'expandable', 'reinforced_straps', 'trolley_sleeve', 'hidden_pocket');

-- CreateEnum
CREATE TYPE "Size" AS ENUM ('small', 'medium', 'large', 'extra_large');

-- CreateEnum
CREATE TYPE "WheelType" AS ENUM ('none', 'two_wheel', 'four_wheel', 'spinner');

-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('male', 'female', 'other');

-- CreateEnum
CREATE TYPE "Providers" AS ENUM ('google', 'facebook');

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('admin', 'member', 'subscriber', 'user');

-- CreateTable
CREATE TABLE "accounts" (
    "id" TEXT NOT NULL,
    "provider" "Providers" NOT NULL,
    "provider_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "user_id" TEXT NOT NULL,

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bags" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "BagType" NOT NULL,
    "color" TEXT DEFAULT 'black',
    "size" "Size" NOT NULL,
    "capacity" DOUBLE PRECISION NOT NULL,
    "maxWeight" DOUBLE PRECISION NOT NULL,
    "weight" DOUBLE PRECISION NOT NULL,
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
    "volume" DOUBLE PRECISION NOT NULL,
    "color" TEXT DEFAULT 'black',
    "is_fragile" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "user_id" TEXT,

    CONSTRAINT "items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "suitcases" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "brand" TEXT,
    "type" "SuitcaseType" NOT NULL,
    "color" TEXT DEFAULT 'black',
    "size" "Size" NOT NULL,
    "capacity" DOUBLE PRECISION NOT NULL,
    "maxWeight" DOUBLE PRECISION NOT NULL,
    "weight" DOUBLE PRECISION NOT NULL,
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
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'user',
    "profilePicture" TEXT,
    "gender" "Gender",
    "birth" TIMESTAMP(3),
    "country" TEXT,
    "city" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "isEmailVerified" BOOLEAN NOT NULL DEFAULT false,
    "verify_token" TEXT,
    "password_change_at" TIMESTAMP(3),
    "password_reset_token" TEXT,
    "password_reset_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "permissions" (
    "id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "subject" TEXT[],

    CONSTRAINT "permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "role_on_permission" (
    "id" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "permissionId" TEXT NOT NULL,

    CONSTRAINT "role_on_permission_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "accounts_provider_id_key" ON "accounts"("provider_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_password_reset_token_key" ON "users"("password_reset_token");

-- CreateIndex
CREATE UNIQUE INDEX "permissions_action_subject_key" ON "permissions"("action", "subject");

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
ALTER TABLE "suitcases" ADD CONSTRAINT "suitcases_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "suitcase_items" ADD CONSTRAINT "suitcase_items_suitcase_id_fkey" FOREIGN KEY ("suitcase_id") REFERENCES "suitcases"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "suitcase_items" ADD CONSTRAINT "suitcase_items_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_on_permission" ADD CONSTRAINT "role_on_permission_permissionId_fkey" FOREIGN KEY ("permissionId") REFERENCES "permissions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
