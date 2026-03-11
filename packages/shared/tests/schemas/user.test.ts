import { it, describe, expect } from 'vitest';
import { userFactory } from '../factories/user.factory';
import { profileFactory } from '../factories/profile.factory';
import { AdminSchema } from '../../src/schemas/user.schema';
import { Role } from '../../src/constants/auth.enums';

describe('AdminSchema.createUser()', () => {
	it('accepts valid admin user creation input', () => {
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
			confirmPassword: 'Strong@123',
		});
	});

	it('rejects confirmPassword when empty after trimming', () => {
		const { email } = userFactory();
		const { firstName, lastName } = profileFactory('user-1');

		expect(() =>
			AdminSchema.createUser.parse({
				firstName,
				lastName,
				email,
				password: 'Strong@123',
				confirmPassword: '   ',
			})
		).toThrow();
	});

	it('rejects input when confirmPassword is missing', () => {
		const { email } = userFactory();
		const { firstName, lastName } = profileFactory('user-1');

		expect(() =>
			AdminSchema.createUser.parse({
				firstName,
				lastName,
				email,
				password: 'Strong@123',
			})
		).toThrow();
	});

	it('rejects invalid email', () => {
		const { firstName, lastName } = profileFactory('user-1');

		expect(() =>
			AdminSchema.createUser.parse({
				firstName,
				lastName,
				email: 'not-an-email',
				password: 'Strong@123',
				confirmPassword: 'Strong@123',
			})
		).toThrow();
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

describe('AdminSchema.changeRole()', () => {
	it('accepts valid role', () => {
		expect(AdminSchema.changeRole.parse({ role: Role.ADMIN })).toEqual({
			role: Role.ADMIN,
		});
	});
});

describe('AdminSchema.updateStatus()', () => {
	it('accepts input when only isActive is provided', () => {
		const result = AdminSchema.updateStatus.safeParse({
			isActive: true,
		});

		expect(result.success).toBe(true);
	});

	it('accepts input when only isEmailVerified is provided', () => {
		const result = AdminSchema.updateStatus.safeParse({
			isEmailVerified: false,
		});

		expect(result.success).toBe(true);
	});

	it('accepts input when both status fields are provided', () => {
		const result = AdminSchema.updateStatus.safeParse({
			isActive: true,
			isEmailVerified: true,
		});

		expect(result.success).toBe(true);
	});

	it('rejects empty input', () => {
		const result = AdminSchema.updateStatus.safeParse({});

		expect(result.success).toBe(false);

		expect(result.error?.issues[0]?.message).toBe(
			'Looks like there’s nothing to update just yet — pick at least one status change before we move forward, so the system knows what’s new.'
		);
	});

	it('rejects unknown fields', () => {
		const result = AdminSchema.updateStatus.safeParse({
			isActive: true,
			role: 'ADMIN',
		});

		expect(result.success).toBe(false);
	});

	it('rejects invalid field types', () => {
		const result = AdminSchema.updateStatus.safeParse({
			isActive: 'true',
		});

		expect(result.success).toBe(false);
	});
});
