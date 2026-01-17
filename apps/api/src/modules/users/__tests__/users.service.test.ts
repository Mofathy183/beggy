import { describe, it, expect, vi, beforeEach } from 'vitest';
import { type ExtendedPrismaClient } from '@prisma';
import { Role, ErrorCode } from '@beggy/shared/constants';
import {
	buildProfile,
	buildUser,
	buildUsers,
	profileFactory,
	userFactory,
} from '@beggy/shared/testing/factories';
import { UserService } from '@modules/users';

vi.mock('@shared/utils/password.util', async () => {
	const actual =
		await vi.importActual<typeof import('@shared/utils')>('@shared/utils');

	return {
		...actual,
		hashPassword: vi.fn().mockResolvedValue('hashed-password'),
	};
});

// ---- Prisma mock ----
vi.mock('@prisma/prisma.client', () => ({
	prisma: {
		user: {
			findMany: vi.fn(),
			findUnique: vi.fn(),
			count: vi.fn(),
			create: vi.fn(),
			update: vi.fn(),
			delete: vi.fn(),
			deleteMany: vi.fn(),
		},
		profile: {
			create: vi.fn(),
			update: vi.fn(),
		},
		account: {
			create: vi.fn(),
		},
	},
}));

import { prisma as Prisma } from '@prisma/prisma.client';

const prismaMock = Prisma as unknown as ExtendedPrismaClient;

describe('UserService.getAll()', () => {
	let service: UserService;

	beforeEach(() => {
		vi.clearAllMocks();
		service = new UserService(prismaMock);
	});

	it('returns users with pagination meta', async () => {
		const users = buildUsers(3);

		(prismaMock.user.findMany as any).mockResolvedValue(users);
		(prismaMock.user.count as any).mockResolvedValue(3);

		const result = await service.getAll(
			{ page: 1, limit: 10, offset: 0 },
			{} as any,
			{} as any
		);

		expect(result.users).toHaveLength(3);
		expect(result.meta.hasNextPage).toBe(false);
		expect(result.meta.hasPreviousPage).toBe(false);
	});

	it('sets hasNextPage when extra record exists', async () => {
		const users = buildUsers(11);

		(prismaMock.user.findMany as any).mockResolvedValue(users);
		(prismaMock.user.count as any).mockResolvedValue(11);

		const result = await service.getAll(
			{ page: 1, limit: 10, offset: 0 },
			{} as any,
			{} as any
		);

		expect(result.users).toHaveLength(10);
		expect(result.meta.hasNextPage).toBe(true);
	});
});

describe('UserService.getById()', () => {
	let service: UserService;

	beforeEach(() => {
		vi.clearAllMocks();
		service = new UserService(prismaMock);
	});

	it('returns user when found', async () => {
		const user = buildUser();

		(prismaMock.user.findUnique as any).mockResolvedValue(user);

		const result = await service.getById(user.id);

		expect(result).toEqual(user);
	});

	it('throws when user does not exist', async () => {
		(prismaMock.user.findUnique as any).mockResolvedValue(null);

		await expect(service.getById('missing-id')).rejects.toMatchObject({
			code: ErrorCode.USER_NOT_FOUND,
		});
	});
});

describe('UserService.create()', () => {
	const service = new UserService(prismaMock);

	it('creates user with profile and account', async () => {
		const profile = profileFactory('user-1');
		const user = userFactory(
			{},
			{
				email: {
					firstName: profile.firstName,
					lastName: profile.lastName,
				},
			}
		);

		(prismaMock.user.create as any).mockResolvedValue(user);

		const result = await service.create({
			email: user.email,
			password: 'password123',
			firstName: profile.firstName,
			lastName: profile.lastName,
		} as any);

		expect(prismaMock.user.create).toHaveBeenCalledOnce();
		expect(result).toEqual(user);
	});
});

describe('UserService.updateProfile()', () => {
	const service = new UserService(prismaMock);

	it('updates user profile fields', async () => {
		const profile = buildProfile('user-id');

		(prismaMock.profile.update as any).mockResolvedValue(profile);

		const result = await service.updateProfile('user-id', {
			firstName: 'Gon',
		} as any);

		expect(prismaMock.profile.update).toHaveBeenCalledOnce();
		expect(result).toEqual(profile);
	});
});

describe('UserService.updateStatus()', () => {
	const service = new UserService(prismaMock);

	it('updates active and verification status', async () => {
		const user = buildUser({ isActive: false });

		(prismaMock.user.update as any).mockResolvedValue(user);

		const result = await service.updateStatus(user.id, {
			isActive: false,
			isEmailVerified: true,
		});

		expect(result.isActive).toBe(false);
	});
});

describe('UserService.changeRole()', () => {
	const service = new UserService(prismaMock);

	it('updates user role', async () => {
		const user = buildUser({ role: Role.ADMIN });

		(prismaMock.user.update as any).mockResolvedValue(user);

		const result = await service.changeRole(user.id, Role.ADMIN);

		expect(result.role).toBe(Role.ADMIN);
	});
});

describe('UserService.deleteById()', () => {
	const service = new UserService(prismaMock);

	it('deletes user by id', async () => {
		const user = buildUser();

		(prismaMock.user.delete as any).mockResolvedValue(user);

		const result = await service.deleteById(user.id);

		expect(result).toEqual(user);
	});
});

describe('UserService.deleteMany()', () => {
	const service = new UserService(prismaMock);

	it('returns delete summary', async () => {
		(prismaMock.user.deleteMany as any).mockResolvedValue({ count: 3 });

		const result = await service.deleteMany();

		expect(result.count).toBe(3);
	});
});
