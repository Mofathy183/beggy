import { prisma } from '@prisma';
import { Role, type Permissions } from '@beggy/shared/types';
import { RolePermissions } from '@beggy/shared/constants';
// import { faker } from '@faker-js/faker';
// import {
// 	ItemCategory,
// 	BagType,
// 	BagFeature,
// 	Size,
// 	Material,
// 	SuitcaseType,
// 	SuitcaseFeature,
// 	WheelType,
// 	Gender,
// } from '../generated/client/index.js';

// async function main() {
// 	const size = Object.values(Size);
// 	const bagType = Object.values(BagType);
// 	const material = Object.values(Material);
// 	const bagFeature = Object.values(BagFeature);
// 	const itemCategory = Object.values(ItemCategory);
// 	const suitcaseType = Object.values(SuitcaseType);
// 	const suitcaseFeature = Object.values(SuitcaseFeature);
// 	const wheels = Object.values(WheelType);
// 	const gender = Object.values(Gender);

// 	await prisma.user.createManyAndReturn({
// 		data: Array.from({ length: 10 }, (_, index) => ({
// 			firstName: faker.person.firstName(),
// 			lastName: faker.person.lastName(),
// 			email: faker.internet.email(),
// 			password: faker.internet.password(),
// 			gender: faker.helpers.arrayElement(gender),
// 			birth: faker.date.past(),
// 			country: faker.location.country(),
// 			city: faker.location.city(),
// 			profilePicture: index % 2 ? faker.image.avatar() : undefined,
// 		})),
// 	});

// 	await prisma.items.createManyAndReturn({
// 		data: Array.from({ length: 10 }, () => ({
// 			name: faker.company.name(),
// 			category: faker.helpers.arrayElement(itemCategory),
// 			quantity: faker.number.int({ min: 1, max: 100 }),
// 			volume: Number(
// 				parseFloat(
// 					faker.number.float({ min: 1.5, max: 15, precision: 0.1 })
// 				).toFixed(2)
// 			),
// 			weight: Number(
// 				parseFloat(
// 					faker.number.float({ min: 1.5, max: 15, precision: 0.1 })
// 				).toFixed(2)
// 			),
// 			color: faker.color.human(),
// 			isFragile: faker.datatype.boolean(),
// 		})),
// 	});

// 	await prisma.bags.createManyAndReturn({
// 		data: Array.from({ length: 10 }, () => ({
// 			name: faker.company.name(),
// 			type: faker.helpers.arrayElement(bagType),
// 			color: faker.color.human(),
// 			size: faker.helpers.arrayElement(size),
// 			capacity: Number(
// 				parseFloat(
// 					faker.number.float({ min: 1.5, max: 15, precision: 0.1 })
// 				).toFixed(2)
// 			),
// 			maxWeight: Number(
// 				parseFloat(
// 					faker.number.float({ min: 1.5, max: 15, precision: 0.1 })
// 				).toFixed(2)
// 			),
// 			weight: Number(
// 				parseFloat(
// 					faker.number.float({ min: 1.5, max: 15, precision: 0.1 })
// 				).toFixed(2)
// 			),
// 			material: faker.helpers.arrayElement(material),
// 			features: [faker.helpers.arrayElement(bagFeature)],
// 		})),
// 	});

// 	await prisma.suitcases.createManyAndReturn({
// 		data: Array.from({ length: 10 }, () => ({
// 			name: faker.company.name(),
// 			brand: faker.commerce.productName(),
// 			type: faker.helpers.arrayElement(suitcaseType),
// 			color: faker.color.human(),
// 			size: faker.helpers.arrayElement(size),
// 			capacity: Number(
// 				parseFloat(
// 					faker.number.float({ min: 1.5, max: 15, precision: 0.1 })
// 				).toFixed(2)
// 			),
// 			maxWeight: Number(
// 				parseFloat(
// 					faker.number.float({ min: 1.5, max: 15, precision: 0.1 })
// 				).toFixed(2)
// 			),
// 			weight: Number(
// 				parseFloat(
// 					faker.number.float({ min: 1.5, max: 15, precision: 0.1 })
// 				).toFixed(2)
// 			),
// 			material: faker.helpers.arrayElement(material),
// 			features: [faker.helpers.arrayElement(suitcaseFeature)],
// 			wheels: faker.helpers.arrayElement(wheels),
// 		})),
// 	});

// 	console.log('✅ Database seeded successfully!');
// }

// await main()
// 	.catch((e) => {
// 		console.error(e);
// 		process.exit(1);
// 	})
// 	.finally(async () => {
// 		await prisma.$disconnect();
// 	});

async function seedPermissions(role: Role, permissions: Permissions) {
	console.log(`🌱 Seeding ${role} permissions...`);

	// Fix 1: createMany instead of createManyAndReturn (which doesn't exist)
	await prisma.permission.createMany({
		data: permissions,
		skipDuplicates: true,
	});

	// Fix 2: Fetch permissions using unique constraint
	const permissionPromises = permissions.map((perm) =>
		prisma.permission.findUnique({
			where: {
				action_scope_subject: {
					action: perm.action,
					scope: perm.scope,
					subject: perm.subject,
				},
			},
		})
	);

	const insertedPermissions = (await Promise.all(permissionPromises)).filter(
		Boolean
	);

	// Assign permissions to role
	await prisma.roleOnPermission.createMany({
		data: insertedPermissions.map((permission) => ({
			permissionId: permission!.id,
			role: role,
		})),
		skipDuplicates: true,
	});

	console.log(`✅ ${role} permissions seeded!`);
}

// Seed all roles
async function seedAllPermissions() {
	console.log('🚀 Starting permission seeding...');

	// For a portfolio project, resetting is fine
	console.log('🔄 Clearing existing permissions...');
	await prisma.roleOnPermission.deleteMany();
	await prisma.permission.deleteMany();

	// Seed roles in order
	await seedPermissions(Role.USER, RolePermissions[Role.USER]);
	await seedPermissions(Role.MEMBER, RolePermissions[Role.MEMBER]);
	await seedPermissions(Role.MODERATOR, RolePermissions[Role.MODERATOR]);
	await seedPermissions(Role.ADMIN, RolePermissions[Role.ADMIN]);

	console.log('🎉 All permissions seeded successfully!');
}

// Main execution
async function main() {
	try {
		await seedAllPermissions();
	} catch (error) {
		console.error('❌ Seeding failed:', error);
		process.exit(1);
	} finally {
		await prisma.$disconnect();
	}
}

// Execute
main();
