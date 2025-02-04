import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();


export const UserModel = prisma.user;
export const AccountModel = prisma.accoount;
export const BagsModel = prisma.bags;
export const SuitcasesModel = prisma.suitcases;
export const ItemsModel = prisma.items;


