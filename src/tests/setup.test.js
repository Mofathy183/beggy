import prisma from '../../prisma/prisma.js';

beforeAll(async () => {
	console.log('Setting up test Database...');

	// Use `migrate reset` if you want to apply migrations and seed data
	// execSync("npx prisma db push", { stdio: "inherit" });

	console.log('Testing Database is Ready');
});

beforeEach(async () => {
	console.log('Clearing test Database...');
	await prisma.userToken.deleteMany();
	await prisma.items.deleteMany();
	await prisma.bags.deleteMany();
	await prisma.suitcases.deleteMany();
	await prisma.suitcaseItems.deleteMany();
	await prisma.bagItems.deleteMany();
	await prisma.account.deleteMany();
	await prisma.user.deleteMany();
});

afterAll(async () => {
	console.log('Closing test Database connection');
	await prisma.$disconnect();
});
