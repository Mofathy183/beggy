import { PrismaClient } from '@prisma-generated/client';
import {
	userExtensions,
	bagExtensions,
	suitcaseExtensions,
} from '@prisma/prisma.util';

// Create extended client with logging based on environment
export const prismaClient = new PrismaClient({} as any);

//* add extension for Prisma to get the age of the user and the display name
// Apply extensions
const extendedPrisma = prismaClient
	.$extends(userExtensions)
	.$extends(bagExtensions)
	.$extends(suitcaseExtensions);

// Export the instance
export const prisma = extendedPrisma;
