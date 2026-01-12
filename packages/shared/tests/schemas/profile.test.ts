import { it, describe, expect } from 'vitest';
import { profileFactory } from '@beggy/shared-factories';
import { ProfileSchema } from '@beggy/shared/schemas';
import { Gender, Role } from '@beggy/shared/types';

describe('ProfileSchema.editProfile', () => {
	it('accepts an empty object for partial updates', () => {
		expect(() => ProfileSchema.editProfile.parse({})).not.toThrow();
	});

	it('accepts a single field update', () => {
		const result = ProfileSchema.editProfile.parse({
			firstName: 'Mohamed',
		});

		expect(result).toEqual({
			firstName: 'Mohamed',
		});
	});

	it('accepts multiple profile fields together', () => {
		const { userId, ...mockProfile } = profileFactory(
			'user-1',
			{},
			{ withDetails: true }
		);
		const result = ProfileSchema.editProfile.parse(mockProfile);

		expect(result).toEqual(mockProfile);
	});

	it('rejects unknown fields to prevent mass assignment', () => {
		expect(() =>
			ProfileSchema.editProfile.parse({
				firstName: 'Mohamed',
				role: Role.ADMIN,
			})
		).toThrow();
	});

	it('accepts a valid gender value when provided', () => {
		const result = ProfileSchema.editProfile.parse({
			gender: Gender.MALE,
		});

		expect(result).toEqual({
			gender: Gender.MALE,
		});
	});
});
