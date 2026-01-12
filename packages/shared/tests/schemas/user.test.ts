import { it, describe, expect } from 'vitest';
import { userFactory, profileFactory } from '@beggy/shared-factories';
import { AdminSchema } from '@beggy/shared/schemas';
import { Role } from '@beggy/shared/types';

describe('AdminSchema.createUser', () => {
	it('accepts a valid admin user payload', () => {
		const { email } = userFactory();
		const { firstName, lastName } = profileFactory('user-1');

		const input = {
			firstName,
			lastName,
			email,
			password: 'Strong@123',
			confirmPassword: 'Strong@123',
		};

		const result = AdminSchema.createUser.safeParse(input);

		expect(result.success).toBe(true);
		expect(result.data).toEqual({
			firstName,
			lastName,
			email: email.toLowerCase(),
			password: 'Strong@123',
		});
	});

	it('rejects when password and confirmPassword do not match', () => {
		const { email } = userFactory();
		const { firstName, lastName } = profileFactory('user-1');

		const input = {
			firstName,
			lastName,
			email,
			password: 'Strong@123',
			confirmPassword: 'Wrong@123',
		};

		expect(() => AdminSchema.createUser.parse(input)).toThrow();
	});

	it('rejects unknown fields', () => {
		const { email } = userFactory();
		const { firstName, lastName } = profileFactory('user-1');

		const input = {
			firstName,
			lastName,
			email,
			password: 'Strong@123',
			confirmPassword: 'Wrong@123',
			role: Role.ADMIN,
		};

		expect(() => AdminSchema.createUser.parse(input)).toThrow();
	});
});

describe('AdminSchema.changeRole', () => {
	it('accepts a valid role', () => {
		expect(AdminSchema.changeRole.parse({ role: Role.ADMIN })).toEqual({
			role: Role.ADMIN,
		});
	});
});
