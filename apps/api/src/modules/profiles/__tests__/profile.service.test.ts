import { describe, it, expect, vi, beforeEach } from 'vitest';
import { type PrismaClientType } from '@prisma';
import { ErrorCode } from '@beggy/shared/constants';
import type { EditProfileInput } from '@beggy/shared/types';
import {
	buildProfile,
	profileFactory,
} from '@/modules/profiles/__tests__/factories/profile.factory';
import { ProfileService } from '@modules/profiles';

import { prisma as Prisma } from '@prisma/prisma.client';

vi.mock('@prisma/prisma.client', () => ({
	prisma: {
		profile: {
			findUnique: vi.fn(),
			update: vi.fn(),
		},
	},
}));

const prismaMock = Prisma as unknown as PrismaClientType;

describe('ProfileService', () => {
	let service: ProfileService;

	beforeEach(() => {
		vi.clearAllMocks();
		service = new ProfileService(prismaMock);
	});

	describe('getPrivateProfile()', () => {
		it('returns the profile when it exists', async () => {
			const profile = buildProfile('user-1');

			(prismaMock.profile.findUnique as any).mockResolvedValue(profile);

			const result = await service.getPrivateProfile(profile.userId);

			expect(result).toEqual(profile);
		});

		it('throws PROFILE_NOT_FOUND when the profile does not exist', async () => {
			(prismaMock.profile.findUnique as any).mockResolvedValue(null);

			await expect(
				service.getPrivateProfile('missing-user-id')
			).rejects.toMatchObject({
				code: ErrorCode.PROFILE_NOT_FOUND,
			});
		});
	});

	describe('getPublicProfile()', () => {
		it('returns the profile when it exists', async () => {
			const profile = buildProfile('user-1');

			(prismaMock.profile.findUnique as any).mockResolvedValue(profile);

			const result = await service.getPublicProfile(profile.id);

			expect(result).toEqual(profile);
		});

		it('throws PROFILE_NOT_FOUND when the profile does not exist', async () => {
			(prismaMock.profile.findUnique as any).mockResolvedValue(null);

			await expect(
				service.getPublicProfile('missing-profile-id')
			).rejects.toMatchObject({
				code: ErrorCode.PROFILE_NOT_FOUND,
			});
		});
	});

	describe('updateProfile()', () => {
		it('updates the profile with the provided fields', async () => {
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

	describe('completeOnboarding()', () => {
		it('updates the profile and marks onboarding as completed', async () => {
			const profile = buildProfile('user-1');

			const input = profileFactory('user-1', {
				firstName: 'John',
				lastName: 'Doe',
			});

			(prismaMock.profile.update as any).mockResolvedValue(profile);

			const result = await service.completeOnboarding(
				profile.userId,
				input as EditProfileInput
			);

			expect(prismaMock.profile.update).toHaveBeenCalledWith({
				where: { userId: profile.userId },
				data: expect.objectContaining({
					firstName: 'John',
					lastName: 'Doe',
					onboardingCompleted: true,
				}),
			});

			expect(result).toEqual(profile);
		});

		it('ignores undefined and null fields from the onboarding input', async () => {
			const profile = buildProfile('user-1');

			const input = profileFactory('user-1', {
				firstName: 'John',
				lastName: undefined,
				city: null,
			});

			(prismaMock.profile.update as any).mockResolvedValue(profile);

			await service.completeOnboarding(
				profile.userId,
				input as EditProfileInput
			);

			expect(prismaMock.profile.update).toHaveBeenCalledWith({
				where: { userId: profile.userId },
				data: expect.objectContaining({
					firstName: 'John',
					onboardingCompleted: true,
				}),
			});
		});

		it('updates the profile for the provided userId', async () => {
			const profile = buildProfile('user-123');

			const input = profileFactory('user-123');

			(prismaMock.profile.update as any).mockResolvedValue(profile);

			await service.completeOnboarding(
				profile.userId,
				input as EditProfileInput
			);

			expect(prismaMock.profile.update).toHaveBeenCalledWith(
				expect.objectContaining({
					where: { userId: 'user-123' },
				})
			);
		});
	});
});
