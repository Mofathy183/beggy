import { describe, it, expect, vi, beforeEach } from 'vitest';

import { ErrorCode } from '@beggy/shared/constants';
import { LoginInput, SignUpPayload } from '@beggy/shared/types';
import { AuthProvider, Role } from '@prisma-generated/enums';
import { profileFactory } from '@/modules/profiles/__tests__/factories/profile.factory';
import { buildUser } from '@modules/users/__tests__/factories/user.factory';
import { AuthService } from '@modules/auth';

vi.mock('@shared/utils/password.util', async () => {
	const actual =
		await vi.importActual<typeof import('@shared/utils')>('@shared/utils');

	return {
		...actual,
		hashPassword: vi.fn().mockResolvedValue('hashed-password'),
		verifyPassword: vi.fn().mockResolvedValue('verify-password'),
	};
});

import { hashPassword, verifyPassword } from '@shared/utils';

// ---- Prisma mock ----
vi.mock('@prisma/prisma.client', () => ({
	prisma: {
		user: {
			findUnique: vi.fn(),
			create: vi.fn(),
			update: vi.fn(),
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

import { prisma as Prisma, PrismaClientType } from '@prisma/prisma.client';

const prismaMock = Prisma as unknown as PrismaClientType;

describe('AuthService', () => {
	let service: AuthService;

	beforeEach(() => {
		vi.clearAllMocks();
		service = new AuthService(prismaMock);
	});

	describe('signupUser()', () => {
		it('creates a new user with hashed password', async () => {
			const createdUser = buildUser();
			const { userId: _ignoreUserId, ...profileData } =
				profileFactory('user-1');

			(hashPassword as any).mockResolvedValue('hashed-password');
			(prismaMock.user.create as any).mockResolvedValue(createdUser);

			const result = await service.signupUser({
				email: createdUser.email,
				password: 'plain-password',
				...profileData,
			} as SignUpPayload);

			expect(hashPassword).toHaveBeenCalledWith('plain-password');

			expect(prismaMock.user.create).toHaveBeenCalledWith({
				data: {
					email: createdUser.email,
					account: {
						create: {
							authProvider: 'LOCAL',
							hashedPassword: 'hashed-password',
						},
					},
					profile: {
						create: {
							...profileData,
						},
					},
				},
			});

			expect(result).toEqual(createdUser);
		});
	});

	describe('loginUser()', () => {
		it('throws when user is not found', async () => {
			(prismaMock.user.findUnique as any).mockResolvedValue(null);

			await expect(
				service.loginUser({
					email: 'missing@example.com',
					password: 'password',
				} as LoginInput)
			).rejects.toMatchObject({
				code: ErrorCode.INVALID_CREDENTIALS,
			});
		});

		it('throws when user is disabled', async () => {
			const user = {
				...buildUser(),
				isActive: false,
				isEmailVerified: true,
				account: [],
			};

			(prismaMock.user.findUnique as any).mockResolvedValue(user);

			await expect(
				service.loginUser({
					email: user.email,
					password: 'password',
				} as LoginInput)
			).rejects.toMatchObject({
				code: ErrorCode.USER_DISABLED,
			});
		});

		it('throws when user has no LOCAL account', async () => {
			const user = {
				...buildUser(),
				isActive: true,
				isEmailVerified: true,
				account: [],
			};

			(prismaMock.user.findUnique as any).mockResolvedValue(user);

			await expect(
				service.loginUser({
					email: user.email,
					password: 'password',
				} as LoginInput)
			).rejects.toMatchObject({
				code: ErrorCode.INVALID_CREDENTIALS,
			});
		});

		it('throws when password does not match', async () => {
			const user = {
				...buildUser(),
				isActive: true,
				isEmailVerified: true,
				account: [
					{
						authProvider: AuthProvider.LOCAL,
						hashedPassword: 'hashed',
					},
				],
			};

			(prismaMock.user.findUnique as any).mockResolvedValue(user);
			(verifyPassword as any).mockResolvedValue(false);

			await expect(
				service.loginUser({
					email: user.email,
					password: 'wrong-password',
				} as LoginInput)
			).rejects.toMatchObject({
				code: ErrorCode.PASSWORDS_DO_NOT_MATCH,
			});
		});

		it('returns user id and role when credentials are valid', async () => {
			const user = {
				...buildUser({ role: Role.ADMIN }),
				isActive: true,
				isEmailVerified: true,
				account: [
					{
						authProvider: AuthProvider.LOCAL,
						hashedPassword: 'hashed',
					},
				],
			};

			(prismaMock.user.findUnique as any).mockResolvedValue(user);
			(verifyPassword as any).mockResolvedValue(true);

			const result = await service.loginUser({
				email: user.email,
				password: 'password',
			} as LoginInput);

			expect(result).toEqual({
				id: user.id,
				role: user.role,
			});
		});
	});

	describe('authUser()', () => {
		it('throws when user does not exist', async () => {
			(prismaMock.user.findUnique as any).mockResolvedValue(null);

			await expect(service.authUser('missing-id')).rejects.toMatchObject({
				code: ErrorCode.UNAUTHORIZED,
			});
		});

		it('returns user snapshot and permissions', async () => {
			const user = {
				...buildUser({ role: Role.USER }),
				profile: {},
				account: [],
			};

			(prismaMock.user.findUnique as any).mockResolvedValue(user);

			const result = await service.authUser(user.id);

			expect(result.user).toEqual(user);
			expect(result.permissions).toBeDefined();
		});
	});
});
