import prisma from '../../prisma/prisma.js';
import type { PrismaClient } from '../generated/client/index.js';

export const resetTestDatabase = async () => {
	console.log('🔄 Resetting test database...');

	await prisma.$transaction([
		prisma.userToken.deleteMany(),
		prisma.suitcaseItems.deleteMany(),
		prisma.bagItems.deleteMany(),
		prisma.items.deleteMany(),
		prisma.bags.deleteMany(),
		prisma.suitcases.deleteMany(),
		prisma.account.deleteMany(),
		prisma.user.deleteMany(),
	]);

	console.log('✅ Test database reset complete.');
};

beforeAll(async () => {
	console.log('🧪 Connecting to the test database...');
	await prisma.$connect();
	console.log('✅ Connected.');
});

beforeEach(async () => {
	await resetTestDatabase();
});

afterAll(async () => {
	console.log('🧹 Tearing down test environment...');
	await prisma.$disconnect();
	console.log('✅ Database connection closed.');
});

export const filterQuery = (filter) => {
	const query = new URLSearchParams(filter).toString();

	return query;
};
