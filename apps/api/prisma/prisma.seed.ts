import { prisma } from '@prisma';
import {
	Role,
	type Action as PrismaAction,
	type Scope as PrismaScope,
	type Subject as PrismaSubject,
	ContainerType,
	Material,
	ItemCategory,
	WeightUnit,
	VolumeUnit,
	BagType,
	Size,
} from '@prisma-generated/enums';
import type { PermissionCreateManyInput } from '@prisma-generated/models';
import { RolePermissions } from '@beggy/shared/constants';
import type { Permissions } from '@beggy/shared/types';
import { hashPassword } from '@shared/utils';
import { truncateAllTables } from '@tests';

async function seedVideoData() {
	console.log('🎬 Seeding video demo data...');

	await truncateAllTables();

	// ── 1. User + Account + Profile ──────────────────────────────────────────
	const user = await prisma.user.create({
		data: {
			email: 'demo@beggy.dev',
			role: Role.USER,
			isActive: true,
			isEmailVerified: true,

			account: {
				create: {
					authProvider: 'LOCAL',
					hashedPassword: await hashPassword('Demo1234!'), // use your existing hash util
				},
			},

			profile: {
				create: {
					firstName: 'Alex',
					lastName: 'Demo',
					onboardingCompleted: true,
				},
			},
		},
	});

	console.log(`✅ User created: ${user.email}`);

	// ── 2. Items ─────────────────────────────────────────────────────────────
	// Use specific values so the video shows clean readable numbers

	const items = await prisma.item.createManyAndReturn({
		data: [
			{
				userId: user.id,
				name: 'Laptop',
				category: ItemCategory.ELECTRONICS,
				weight: 1.8,
				weightUnit: WeightUnit.KILOGRAM,
				volume: 3.5,
				volumeUnit: VolumeUnit.LITER,
				isFragile: true,
				color: 'silver',
			},
			{
				userId: user.id,
				name: 'T-Shirt',
				category: ItemCategory.CLOTHING,
				weight: 0.2,
				weightUnit: WeightUnit.KILOGRAM,
				volume: 0.5,
				volumeUnit: VolumeUnit.LITER,
				isFragile: false,
				color: 'white',
			},
			{
				userId: user.id,
				name: 'Running Shoes',
				category: ItemCategory.CLOTHING,
				weight: 0.8,
				weightUnit: WeightUnit.KILOGRAM,
				volume: 2.0,
				volumeUnit: VolumeUnit.LITER,
				isFragile: false,
				color: 'black',
			},
			{
				userId: user.id,
				name: 'Toiletry Kit',
				category: ItemCategory.ACCESSORIES,
				weight: 0.5,
				weightUnit: WeightUnit.KILOGRAM,
				volume: 1.0,
				volumeUnit: VolumeUnit.LITER,
				isFragile: false,
				color: 'blue',
			},
			{
				userId: user.id,
				name: 'Water Bottle',
				category: ItemCategory.FOOD,
				weight: 0.3,
				weightUnit: WeightUnit.KILOGRAM,
				volume: 0.75,
				volumeUnit: VolumeUnit.LITER,
				isFragile: false,
				color: 'gray',
			},
		],
	});

	console.log(`✅ ${items.length} items created`);

	// ── 3. Bags (via service-layer shape — container created by Prisma nested write) ──

	const mainBag = await prisma.$transaction(async (tx) => {
		const container = await tx.container.create({
			data: {
				type: ContainerType.BAG,
				userId: user.id,
				maxCapacity: 30,
				maxWeight: 15,
				emptyWeight: 1.2,
			},
		});

		return await tx.bag.create({
			data: {
				containerId: container.id,
				userId: user.id,
				name: 'Travel Backpack',
				type: BagType.BACKPACK,
				size: Size.MEDIUM,
				color: 'black',
				material: Material.CANVAS,
			},
			include: { container: true },
		});
	});

	const destinationBag = await prisma.$transaction(async (tx) => {
		const container = await tx.container.create({
			data: {
				type: ContainerType.BAG,
				userId: user.id,
				maxCapacity: 15,
				maxWeight: 8,
				emptyWeight: 0.6,
			},
		});

		return await tx.bag.create({
			data: {
				containerId: container.id,
				userId: user.id,
				name: 'Day Pack',
				type: BagType.BACKPACK,
				size: Size.SMALL,
				color: 'navy',
				material: Material.NYLON,
			},
			include: { container: true },
		});
	});

	console.log(`✅ Bags created: "${mainBag.name}", "${destinationBag.name}"`);

	// ── 4. Pre-pack the main bag with 2 items so it's not empty on camera ───

	await prisma.containerItems.createMany({
		data: [
			{
				containerId: mainBag.containerId,
				itemId: items[1]?.id as string, // T-Shirt
				quantity: 3,
			},
			{
				containerId: mainBag.containerId,
				itemId: items[2]?.id as string, // Running Shoes
				quantity: 1,
			},
		],
	});

	console.log('✅ Main bag pre-packed with T-Shirts and Running Shoes');
	console.log('🎬 Demo seed complete. Login: demo@beggy.dev / Demo1234!');
}

await seedVideoData()
	.catch((e) => {
		console.error('❌ Seed failed:', e);
		process.exit(1);
	})
	.finally(() => prisma.$disconnect());

const mapPermissionsToPrisma = (permissions: Permissions) => {
	return permissions.map((perm) => ({
		action: perm.action as PrismaAction,
		scope: perm.scope as PrismaScope,
		subject: perm.subject as PrismaSubject,
	}));
};

async function seedPermissions(
	role: Role,
	permissions: PermissionCreateManyInput[]
) {
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
	await seedPermissions(
		Role.USER,
		mapPermissionsToPrisma(RolePermissions[Role.USER])
	);
	await seedPermissions(
		Role.MEMBER,
		mapPermissionsToPrisma(RolePermissions[Role.MEMBER])
	);
	await seedPermissions(
		Role.MODERATOR,
		mapPermissionsToPrisma(RolePermissions[Role.MODERATOR])
	);
	await seedPermissions(
		Role.ADMIN,
		mapPermissionsToPrisma(RolePermissions[Role.ADMIN])
	);

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
void main();
