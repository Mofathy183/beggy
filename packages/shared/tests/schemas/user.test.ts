import { it, describe, expect } from 'vitest';
import { userFactory } from '../factories/user.factory';
import { profileFactory } from '../factories/profile.factory';
import { AdminSchema } from '../../src/schemas/user.schema';
import { Role } from '../../src/constants/auth.enums';

describe('AdminSchema.createUser()', () => {
	it('parses a valid admin user creation payload', () => {
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

	it('throws when password and confirmPassword do not match', () => {
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

	it('throws when unknown fields are provided', () => {
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

describe('AdminSchema.changeRole()', () => {
	it('parses a valid role change payload', () => {
		expect(AdminSchema.changeRole.parse({ role: Role.ADMIN })).toEqual({
			role: Role.ADMIN,
		});
	});
});

describe('AdminSchema.updateStatus()', () => {
	it('parses payload when only isActive is provided', () => {
		const result = AdminSchema.updateStatus.safeParse({
			isActive: true,
		});

		expect(result.success).toBe(true);
	});

	it('parses payload when only isEmailVerified is provided', () => {
		const result = AdminSchema.updateStatus.safeParse({
			isEmailVerified: false,
		});

		expect(result.success).toBe(true);
	});

	it('parses payload when both status fields are provided', () => {
		const result = AdminSchema.updateStatus.safeParse({
			isActive: true,
			isEmailVerified: true,
		});

		expect(result.success).toBe(true);
	});

	it('fails when no fields are provided (empty update)', () => {
		const result = AdminSchema.updateStatus.safeParse({});

		expect(result.success).toBe(false);

		expect(result.error?.issues[0]?.message).toBe(
			'Looks like there’s nothing to update just yet — pick at least one status change before we move forward, so the system knows what’s new.'
		);
	});

	it('fails when unknown fields are provided', () => {
		const result = AdminSchema.updateStatus.safeParse({
			isActive: true,
			role: 'ADMIN',
		});

		expect(result.success).toBe(false);
	});

	it('fails when field values have invalid types', () => {
		const result = AdminSchema.updateStatus.safeParse({
			isActive: 'true',
		});

		expect(result.success).toBe(false);
	});
});