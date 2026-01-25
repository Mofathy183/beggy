import { envConfig } from '@/config';
import { Prisma, PrismaClient } from '@prisma-generated/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { getAge, getDisplayName } from '@prisma/prisma.util';

export const profileExtensions = Prisma.defineExtension({
	name: 'ProfileComputedFields',
	result: {
		profile: {
			displayName: {
				needs: { firstName: true, lastName: true },
				compute(user) {
					const { firstName, lastName } = user;
					return getDisplayName(firstName, lastName);
				},
			},
			age: {
				needs: { birthDate: true },
				compute(user) {
					const { birthDate } = user;
					return getAge(birthDate);
				},
			},
		},
	},
});

const connectionString = `${process.env.DATABASE_URL}`;

const adapter = new PrismaPg({ connectionString });

/**
 * Singleton Prisma client with PostgreSQL adapter and extensions.
 */
export const prisma = new PrismaClient({
	adapter,
	log: envConfig.server.isProduction ? ['warn'] : ['warn', 'error'],
}).$extends(profileExtensions);

/**
 * Type representing the extended Prisma client instance.
 */
export type PrismaClientType = typeof prisma;
