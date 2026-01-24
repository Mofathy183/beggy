import { envConfig } from '@/config';
import { PrismaClient } from '@prisma-generated/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { profileExtensions } from '@prisma/prisma.util';

const connectionString = `${process.env.DATABASE_URL}`;

const adapter = new PrismaPg({ connectionString });

/**
 * Singleton Prisma client with PostgreSQL adapter and extensions.
 */
export const prisma = new PrismaClient({
	adapter,
	log: envConfig.server.isProduction
		? ['warn', 'error']
		: ['query', 'warn', 'error'],
}).$extends(profileExtensions);

/**
 * Type representing the extended Prisma client instance.
 */
export type PrismaClientType = typeof prisma;
