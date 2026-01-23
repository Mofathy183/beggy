import { PrismaClient } from '@prisma-generated/client';
import { PrismaPg } from '@prisma/adapter-pg';
import {
	profileExtensions,
	bagExtensions,
	suitcaseExtensions,
} from '@prisma/prisma.util';

const connectionString = `${process.env.DATABASE_URL}`;

const adapter = new PrismaPg({ connectionString });

// Create extended client with logging based on environment
export const prismaClient = new PrismaClient({
	adapter,
	log: ['warn', 'error'],
});

//* add extension for Prisma to get the age of the user and the display name
// Apply extensions
const extendedPrisma = prismaClient
	.$extends(profileExtensions)
	.$extends(bagExtensions)
	.$extends(suitcaseExtensions);

// Export the instance
export const prisma = extendedPrisma;
