import { PrismaClient } from '@prisma-generated/client';
import {
	userExtensions,
	bagExtensions,
	suitcaseExtensions,
} from '@prisma/prisma.util';

//* add extension for Prisma to get the age of the user and the display name
export const prisma = new PrismaClient({} as any)
	.$extends(userExtensions)
	.$extends(bagExtensions)
	.$extends(suitcaseExtensions);