import { describe, it, beforeEach, afterAll, expect } from 'vitest';
import { truncateAllTables, prisma } from '@prisma';
import type { CreateUserPayload, EditProfileInput } from '@beggy/shared/types';

import { UserService } from '@modules/users';
import { userFactory } from '@modules/users/__tests__/factories/user.factory';
import { profileFactory } from '@modules/profiles/__tests__/factories/profile.factory';
import { Role } from '@beggy/shared/constants';

describe('UserService', () => {
	let service: UserService;

	beforeEach(async () => {
		service = new UserService(prisma);

		await truncateAllTables(prisma);
	});

	afterAll(async () => {
		await prisma.$disconnect();
	});

	it('creates a user with profile and account', async () => {
		// Arrange
		const { userId: _ignoredUserId, ...profileData } = profileFactory(
			'user-1',
			{},
			{ withDetails: true }
		);
		const input = {
			...userFactory(
				{},
				{
					email: {
						firstName: profileData.firstName,
						lastName: profileData.lastName,
					},
				}
			),
			password: 'Password123!',
			...profileData,
		} as CreateUserPayload;

		// Act
		const createdUser = await service.createUser(input); //that create users locally only

		// Assert
		const user = await prisma.user.findUnique({
			where: { id: createdUser.id },
		});

		const profile = await prisma.profile.findUnique({
			where: { userId: createdUser.id },
		});

		const account = await prisma.account.findUnique({
			where: {
				userId_authProvider: {
					userId: createdUser.id,
					authProvider: 'LOCAL',
				},
			},
		});

		expect(user?.email).toBe(input.email);
		expect(profile?.userId).toBe(user!.id);
		expect(account?.authProvider).toBe('LOCAL');
	});

	it('rejects duplicate email', async () => {
		// Arrange
		const email = 'duplicate@example.com';

		const { userId: _ignoredUserId, ...profileData } =
			profileFactory('user-1');
		const input = {
			...userFactory({ email }),
			password: 'Password123!',
			...profileData,
		} as CreateUserPayload;

		// Act
		await service.createUser(input);

		// Assert
		await expect(
			service.createUser({
				...userFactory({ email }),
				password: 'AnotherPassword123!',
				...profileData,
			} as CreateUserPayload)
		).rejects.toBeTruthy();
	});

	it('updates profile data', async () => {
		// Arrange
		const { userId: _ignoredUserId, ...profileData } =
			profileFactory('user-1');
		const user = await service.createUser({
			...userFactory(),
			password: 'Password123!',
			...profileData,
		} as CreateUserPayload);

		// Act
		await service.updateProfile(user.id, {
			firstName: 'Updated',
			city: 'Alexandria',
		} as EditProfileInput);

		// Assert
		const profile = await prisma.profile.findUnique({
			where: { userId: user.id },
		});

		expect(profile?.firstName).toBe('Updated');
		expect(profile?.city).toBe('Alexandria');
	});

	it('deletes a user', async () => {
		// Arrange
		const { userId: _ignoredUserId, ...profileData } =
			profileFactory('user-1');
		const user = await service.createUser({
			...userFactory(),
			password: 'Password123!',
			...profileData,
		} as CreateUserPayload);

		// Act
		await service.deleteById(user.id);

		// Assert
		const deletedUser = await prisma.user.findUnique({
			where: { id: user.id },
		});

		expect(deletedUser).toBeNull();
	});

	it('deletes users by filter', async () => {
		// Arrange
		const { userId: _ignoredUserId1, ...profileData1 } =
			profileFactory('user-1');
		const { userId: _ignoredUserId2, ...profileData2 } =
			profileFactory('user-1');

		await service.createUser({
			...userFactory({ role: 'USER' }),
			password: 'Password123!',
			...profileData1,
		} as CreateUserPayload);

		await service.createUser({
			...userFactory({ role: 'USER' }),
			password: 'Password123!',
			...profileData2,
		} as CreateUserPayload);

		// Act
		const result = await service.deleteUsers({ role: Role.USER });

		// Assert
		expect(result.count).toBe(2);

		const remaining = await prisma.user.count();
		expect(remaining).toBe(0);
	});
});
