import { describe, it, expect, vi, beforeEach } from 'vitest';

import { ProfileMapper } from '@modules/profiles/profile.mapper';
import { Gender } from '@beggy/shared/constants';

import { buildProfile } from '@/modules/profiles/__tests__/factories/profile.factory';

vi.mock('@prisma/prisma.util', () => ({
	getDisplayName: vi.fn(),
	getAge: vi.fn(),
}));

vi.mock('@shared/utils/transform.util', () => ({
	toISO: vi.fn(),
}));

import { getAge, getDisplayName } from '@prisma';
import { toISO } from '@shared/utils';

describe('ProfileMapper', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('toDTO()', () => {
		it('returns normalized profile data', () => {
			// Arrange
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

			// Act
			const result = ProfileMapper.toDTO(profile);

			// Assert — core fields
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

			// Assert — dates normalized
			expect(toISO).toHaveBeenCalledWith(profile.createdAt);
			expect(toISO).toHaveBeenCalledWith(profile.updatedAt);

			// Assert — computed fallbacks
			expect(getDisplayName).toHaveBeenCalledWith(
				profile.firstName,
				profile.lastName
			);
			expect(getAge).toHaveBeenCalledWith(profile.birthDate);
		});

		it('returns provided display name and age', () => {
			// Arrange
			const profile = {
				...buildProfile('user-id'),
				displayName: 'Precomputed Name',
				age: 42,
			};

			(toISO as any).mockImplementation((date: Date) =>
				date.toISOString()
			);

			// Act
			const result = ProfileMapper.toDTO(profile);

			// Assert
			expect(result.displayName).toBe('Precomputed Name');
			expect(result.age).toBe(42);

			expect(getDisplayName).not.toHaveBeenCalled();
			expect(getAge).not.toHaveBeenCalled();
		});

		it('returns null age when birth date is missing', () => {
			// Arrange
			const profile = {
				...buildProfile('user-id', { birthDate: null }),
				age: undefined,
			};

			(toISO as any).mockImplementation((date: Date) =>
				date.toISOString()
			);

			// Act
			const result = ProfileMapper.toDTO(profile);

			// Assert
			expect(result.age).toBeNull();
			expect(getAge).not.toHaveBeenCalled();
		});
	});

	describe('toPublicDTO()', () => {
		it('returns public-safe profile data', () => {
			// Arrange
			const profile = {
				...buildProfile('user-id'),
				displayName: null,
				age: null,
			};

			(getDisplayName as any).mockReturnValue('Public Name');
			(getAge as any).mockReturnValue(null);

			// Act
			const result = ProfileMapper.toPublicDTO(profile);

			// Assert — exposed fields only
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
