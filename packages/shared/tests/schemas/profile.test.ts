import { it, describe, expect } from 'vitest';
import { faker } from '@faker-js/faker';
import { profileFactory } from '../factories/profile.factory';
import { ProfileSchema } from '../../src/schemas/profile.schema';
import { Gender } from '../../src/constants/profile.enums';
import { Role } from '../../src/constants/auth.enums';

describe('ProfileSchema.editProfile()', () => {
	it('parses an empty object for partial updates', () => {
		expect(() => ProfileSchema.editProfile.parse({})).not.toThrow();
	});

	it('parses a single profile field update', () => {
		const result = ProfileSchema.editProfile.parse({
			firstName: 'Mohamed',
		});

		expect(result).toEqual({
			firstName: 'Mohamed',
		});
	});

	it('parses multiple profile fields in a single payload', () => {
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

	it('throws when unknown fields are provided (mass assignment protection)', () => {
		expect(() =>
			ProfileSchema.editProfile.parse({
				firstName: 'Mohamed',
				role: Role.ADMIN,
			})
		).toThrow();
	});

	it('parses a valid gender value when provided', () => {
		const result = ProfileSchema.editProfile.parse({
			gender: Gender.MALE,
		});

		expect(result).toEqual({
			gender: Gender.MALE,
		});
	});
});
