import { describe, it, expect, vi, beforeEach } from 'vitest';

import { ProfileMapper } from '@modules/profiles/profile.mapper';
import { Gender } from '@beggy/shared/constants';

import { buildProfile } from '@/modules/profiles/__tests__/factories/profile.factory';

import { toISO } from '@shared/utils';

vi.mock('@prisma/prisma.util', () => ({
	getDisplayName: vi.fn(),
	getAge: vi.fn(),
}));

import { getAge, getDisplayName } from '@prisma/prisma.util';

vi.mock('@shared/utils/transform.util', () => ({
	toISO: vi.fn(),
}));

describe('ProfileMapper', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('toDTO()', () => {
		it('returns normalized profile data', () => {
			const userId = 'user-id';

			const profile = buildProfile(userId, {
				firstName: 'john',
				lastName: 'doe',
				gender: Gender.MALE,
				birthDate: new Date('1994-01-01'),
			});

			(getDisplayName as any).mockReturnValue('John Doe');
			(getAge as any).mockReturnValue(30);
			(toISO as any).mockImplementation((date: Date) =>
				date.toISOString()
			);

			const result = ProfileMapper.toDTO(profile);

			expect(result).toMatchObject({
				id: profile.id,
				userId,
				firstName: profile.firstName,
				lastName: profile.lastName,
				avatarUrl: profile.avatarUrl,
				gender: Gender.MALE,
				country: profile.country,
				city: profile.city,
				displayName: 'John Doe',
				age: 30,
			});

			expect(toISO).toHaveBeenCalledWith(profile.createdAt);
			expect(toISO).toHaveBeenCalledWith(profile.updatedAt);

			expect(getDisplayName).toHaveBeenCalledWith(
				profile.firstName,
				profile.lastName
			);

			expect(getAge).toHaveBeenCalledWith(profile.birthDate);
		});

		it('uses the provided displayName and age when they exist', () => {
			const profile = {
				...buildProfile('user-id'),
				displayName: 'Precomputed Name',
				age: 42,
			};

			(toISO as any).mockImplementation((date: Date) =>
				date.toISOString()
			);

			const result = ProfileMapper.toDTO(profile);

			expect(result.displayName).toBe('Precomputed Name');
			expect(result.age).toBe(42);

			expect(getDisplayName).not.toHaveBeenCalled();
			expect(getAge).not.toHaveBeenCalled();
		});

		it('returns null age when birthDate is missing', () => {
			const profile = {
				...buildProfile('user-id', { birthDate: null }),
				age: undefined,
			};

			(toISO as any).mockImplementation((date: Date) =>
				date.toISOString()
			);

			const result = ProfileMapper.toDTO(profile);

			expect(result.age).toBeNull();
			expect(getAge).not.toHaveBeenCalled();
		});

		it('maps the onboardingCompleted flag correctly', () => {
			const profile = buildProfile('user-id', {
				onboardingCompleted: true,
			});

			(toISO as any).mockImplementation((date: Date) =>
				date.toISOString()
			);

			const result = ProfileMapper.toDTO(profile);

			expect(result.onboardingCompleted).toBe(true);
		});

		it('preserves the onboardingCompleted state', () => {
			const completedProfile = buildProfile('user-1', {
				onboardingCompleted: true,
			});

			const incompleteProfile = buildProfile('user-2', {
				onboardingCompleted: false,
			});

			(toISO as any).mockImplementation((date: Date) =>
				date.toISOString()
			);

			const completed = ProfileMapper.toDTO(completedProfile);
			const incomplete = ProfileMapper.toDTO(incompleteProfile);

			expect(completed.onboardingCompleted).toBe(true);
			expect(incomplete.onboardingCompleted).toBe(false);
		});
	});

	describe('toPublicDTO()', () => {
		it('returns only public-safe profile fields', () => {
			const profile = {
				...buildProfile('user-id'),
				displayName: null,
				age: null,
			};

			(getDisplayName as any).mockReturnValue('Public Name');
			(getAge as any).mockReturnValue(null);

			const result = ProfileMapper.toPublicDTO(profile);

			expect(result).toEqual({
				id: profile.id,
				firstName: profile.firstName,
				lastName: profile.lastName,
				avatarUrl: profile.avatarUrl,
				country: profile.country,
				city: profile.city,
				displayName: 'Public Name',
				age: null,
			});

			expect(getDisplayName).toHaveBeenCalled();
		});
	});
});
