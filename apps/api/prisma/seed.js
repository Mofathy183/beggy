import prisma from './prisma.js';
import { faker } from '@faker-js/faker';
import {
	ItemCategory,
	BagType,
	BagFeature,
	Size,
	Material,
	SuitcaseType,
	SuitcaseFeature,
	WheelType,
	Gender,
} from '../generated/client/index.js';

async function main() {
	const size = Object.values(Size);
	const bagType = Object.values(BagType);
	const material = Object.values(Material);
	const bagFeature = Object.values(BagFeature);
	const itemCategory = Object.values(ItemCategory);
	const suitcaseType = Object.values(SuitcaseType);
	const suitcaseFeature = Object.values(SuitcaseFeature);
	const wheels = Object.values(WheelType);
	const gender = Object.values(Gender);

	await prisma.user.createManyAndReturn({
		data: Array.from({ length: 10 }, (_, index) => ({
			firstName: faker.person.firstName(),
			lastName: faker.person.lastName(),
			email: faker.internet.email(),
			password: faker.internet.password(),
			gender: faker.helpers.arrayElement(gender),
			birth: faker.date.past(),
			country: faker.location.country(),
			city: faker.location.city(),
			profilePicture: index % 2 ? faker.image.avatar() : undefined,
		})),
	});

	await prisma.items.createManyAndReturn({
		data: Array.from({ length: 10 }, () => ({
			name: faker.company.name(),
			category: faker.helpers.arrayElement(itemCategory),
			quantity: faker.number.int({ min: 1, max: 100 }),
			volume: Number(
				parseFloat(
					faker.number.float({ min: 1.5, max: 15, precision: 0.1 })
				).toFixed(2)
			),
			weight: Number(
				parseFloat(
					faker.number.float({ min: 1.5, max: 15, precision: 0.1 })
				).toFixed(2)
			),
			color: faker.color.human(),
			isFragile: faker.datatype.boolean(),
		})),
	});

	await prisma.bags.createManyAndReturn({
		data: Array.from({ length: 10 }, () => ({
			name: faker.company.name(),
			type: faker.helpers.arrayElement(bagType),
			color: faker.color.human(),
			size: faker.helpers.arrayElement(size),
			capacity: Number(
				parseFloat(
					faker.number.float({ min: 1.5, max: 15, precision: 0.1 })
				).toFixed(2)
			),
			maxWeight: Number(
				parseFloat(
					faker.number.float({ min: 1.5, max: 15, precision: 0.1 })
				).toFixed(2)
			),
			weight: Number(
				parseFloat(
					faker.number.float({ min: 1.5, max: 15, precision: 0.1 })
				).toFixed(2)
			),
			material: faker.helpers.arrayElement(material),
			features: [faker.helpers.arrayElement(bagFeature)],
		})),
	});

	await prisma.suitcases.createManyAndReturn({
		data: Array.from({ length: 10 }, () => ({
			name: faker.company.name(),
			brand: faker.commerce.productName(),
			type: faker.helpers.arrayElement(suitcaseType),
			color: faker.color.human(),
			size: faker.helpers.arrayElement(size),
			capacity: Number(
				parseFloat(
					faker.number.float({ min: 1.5, max: 15, precision: 0.1 })
				).toFixed(2)
			),
			maxWeight: Number(
				parseFloat(
					faker.number.float({ min: 1.5, max: 15, precision: 0.1 })
				).toFixed(2)
			),
			weight: Number(
				parseFloat(
					faker.number.float({ min: 1.5, max: 15, precision: 0.1 })
				).toFixed(2)
			),
			material: faker.helpers.arrayElement(material),
			features: [faker.helpers.arrayElement(suitcaseFeature)],
			wheels: faker.helpers.arrayElement(wheels),
		})),
	});

	console.log('✅ Database seeded successfully!');
}

await main()
	.catch((e) => {
		console.error(e);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});

async function seedPermissions(roleName, permissions) {
	await prisma.permission.createManyAndReturn({
		data: permissions,
		skipDuplicates: true,
	});

	//* Fetch the newly inserted permissions
	const insertedPermissions = await prisma.permission.findMany({
		where: {
			OR: permissions.map((perm) => ({
				action: { equals: perm.action },
				subject: { equals: perm.subject },
			})),
		},
	});

	//* Assign permissions to the role
	await prisma.roleOnPermission.createMany({
		data: insertedPermissions.map((permission) => ({
			permissionId: permission.id,
			role: roleName,
		})),
		skipDuplicates: true,
	});

	console.log(`✅ ${roleName} Role Permissions Seeded Successfully!`);
}

const USER_PERMISSIONS = [
	{ action: 'create:own', subject: ['bag', 'item', 'suitcase'] },
	{ action: 'read:own', subject: ['bag', 'item', 'suitcase', 'user'] },
	{ action: 'update:own', subject: ['bag', 'item', 'suitcase', 'user'] },
	{ action: 'delete:own', subject: ['bag', 'item', 'suitcase', 'user'] },
];

const SUBSCRIBER_PERMISSIONS = [...USER_PERMISSIONS];

const MEMBER_PERMISSIONS = [
	...SUBSCRIBER_PERMISSIONS,
	...SUBSCRIBER_PERMISSIONS.map((perm) => {
		return { ...perm, action: perm.action.replace(':own', ':any') };
	}),
];

const ADMIN_PERMISSIONS = [
	...MEMBER_PERMISSIONS.map((perm) => {
		return perm.action.includes(':any')
			? {
					...perm,
					subject: [...perm.subject, 'user'],
				}
			: { ...perm };
	}),
	{ action: 'manage:any', subject: ['role', 'permission'] },
];

// Seed all roles
async function seedAllPermissions() {
	await seedPermissions('USER', USER_PERMISSIONS);
	await seedPermissions('SUBSCRIBER', SUBSCRIBER_PERMISSIONS);
	await seedPermissions('MEMBER', MEMBER_PERMISSIONS);
	await seedPermissions('ADMIN', ADMIN_PERMISSIONS);
}

await seedAllPermissions()
	.catch((err) => {
		console.error(err);
		process.exit(1);
	})
	.finally(() => {
		prisma.$disconnect();
	});
