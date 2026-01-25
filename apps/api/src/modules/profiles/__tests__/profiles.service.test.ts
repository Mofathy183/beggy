import { describe, it, expect, vi, beforeEach } from 'vitest';
import { type PrismaClientType } from '@prisma';
import { ErrorCode } from '@beggy/shared/constants';
import type { EditProfileInput } from '@beggy/shared/types';
import {
	buildProfile,
	profileFactory,
} from '@/modules/profiles/__tests__/factories/profile.factory';
import { ProfileService } from '@modules/profiles';

vi.mock('@prisma/prisma.client', () => ({
	prisma: {
		profile: {
			findUnique: vi.fn(),
			update: vi.fn(),
		},
	},
}));

import { prisma as Prisma } from '@prisma/prisma.client';

const prismaMock = Prisma as unknown as PrismaClientType;

describe('ProfileService', () => {
	let service: ProfileService;

	beforeEach(() => {
		vi.clearAllMocks();
		service = new ProfileService(prismaMock);
	});

	describe('getPrivateProfile()', () => {
		it('returns profile when it exists', async () => {
			const profile = buildProfile('user-1');

			(prismaMock.profile.findUnique as any).mockResolvedValue(profile);

			const result = await service.getPrivateProfile(profile.userId);

			expect(result).toEqual(profile);
		});

		it('throws when profile is missing', async () => {
			(prismaMock.profile.findUnique as any).mockResolvedValue(null);

			await expect(
				service.getPrivateProfile('missing-user-id')
			).rejects.toMatchObject({
				code: ErrorCode.PROFILE_NOT_FOUND,
			});
		});
	});

	describe('getPublicProfile()', () => {
		it('returns profile when it exists', async () => {
			const profile = buildProfile('user-1');

			(prismaMock.profile.findUnique as any).mockResolvedValue(profile);

			const result = await service.getPublicProfile(profile.id);

			expect(result).toEqual(profile);
		});

		it('throws when profile is missing', async () => {
			(prismaMock.profile.findUnique as any).mockResolvedValue(null);

			await expect(
				service.getPublicProfile('missing-profile-id')
			).rejects.toMatchObject({
				code: ErrorCode.PROFILE_NOT_FOUND,
			});
		});
	});

	describe('updateProfile()', () => {
		it('updates provided profile fields', async () => {
			const profile = buildProfile('user-1');

			const input = profileFactory('user-2', {
				firstName: 'Updated',
				lastName: undefined,
				city: null,
			});

			(prismaMock.profile.update as any).mockResolvedValue(profile);

			const result = await service.updateProfile(
				profile.userId,
				input as EditProfileInput
			);

			expect(prismaMock.profile.update).toHaveBeenCalledOnce();
			expect(result).toEqual(profile);
		});
	});
});
