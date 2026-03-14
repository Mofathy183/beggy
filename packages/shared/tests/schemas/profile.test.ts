import { it, describe, expect } from 'vitest';
import { faker } from '@faker-js/faker';
import { profileFactory } from '../factories/profile.factory';
import { ProfileSchema } from '../../src/schemas/profile.schema';
import { Gender } from '../../src/constants/profile.enums';
import { Role } from '../../src/constants/auth.enums';

describe('ProfileSchema.editProfile()', () => {
	it('accepts empty input for partial updates', () => {
		expect(() => ProfileSchema.editProfile.parse({})).not.toThrow();
	});

	it('accepts a single profile field update', () => {
		const result = ProfileSchema.editProfile.parse({
			firstName: 'Mohamed',
		});

		expect(result).toEqual({
			firstName: 'Mohamed',
		});
	});

	it('accepts multiple profile fields in a single payload', () => {
		const { userId: _userId, ...mock } = profileFactory(
			'user-1',
			{},
			{ withDetails: true }
		);

		const mockProfile = {
			...mock,
			birthDate: faker.date.birthdate({ min: 18, max: 65, mode: 'age' }),
		};

		const result = ProfileSchema.editProfile.parse(mockProfile);

		expect(result).toEqual(mockProfile);
	});

	it('rejects unknown fields (mass assignment protection)', () => {
		expect(() =>
			ProfileSchema.editProfile.parse({
				firstName: 'Mohamed',
				role: Role.ADMIN,
			})
		).toThrow();
	});

	it('accepts valid gender when provided', () => {
		const result = ProfileSchema.editProfile.parse({
			gender: Gender.MALE,
		});

		expect(result).toEqual({
			gender: Gender.MALE,
		});
	});
});

describe('ProfileSchema.completeOnboarding()', () => {
	it('returns onboardingCompleted true when all profile fields are provided', () => {
		const { userId: _userId, ...mock } = profileFactory(
			'user-1',
			{},
			{ withDetails: true }
		);

		const input = {
			...mock,
			birthDate: faker.date.birthdate({ min: 18, max: 65, mode: 'age' }),
		};

		const result = ProfileSchema.completeOnboarding.parse(input);

		expect(result.onboardingCompleted).toBe(true);
	});

	it('returns onboardingCompleted false when some fields are missing', () => {
		const result = ProfileSchema.completeOnboarding.parse({
			firstName: 'Mohamed',
			lastName: 'Fathy',
		});

		expect(result).toEqual({
			firstName: 'Mohamed',
			lastName: 'Fathy',
			onboardingCompleted: false,
		});
	});

	it('recomputes onboardingCompleted when provided by the client', () => {
		const result = ProfileSchema.completeOnboarding.parse({
			firstName: 'Mohamed',
			lastName: 'Fathy',
			onboardingCompleted: true,
		});

		expect(result.onboardingCompleted).toBe(false);
	});

	it('rejects unknown fields', () => {
		expect(() =>
			ProfileSchema.completeOnboarding.parse({
				firstName: 'Mohamed',
				role: Role.ADMIN,
			})
		).toThrow();
	});

	it('accepts valid gender when provided', () => {
		const result = ProfileSchema.completeOnboarding.parse({
			gender: Gender.MALE,
		});

		expect(result).toEqual({
			gender: Gender.MALE,
			onboardingCompleted: false,
		});
	});
});
