import { it, describe, expect } from 'vitest';
import { AuthSchema } from '../../src/schemas/auth.schema';

describe('AuthSchema.login()', () => {
	it('accepts valid credentials and defaults rememberMe to false', () => {
		const result = AuthSchema.login.parse({
			email: 'user@example.com',
			password: 'Strong@123',
		});

		expect(result).toEqual({
			email: 'user@example.com',
			password: 'Strong@123',
			rememberMe: false,
		});
	});

	it('rejects unknown fields', () => {
		expect(() =>
			AuthSchema.login.parse({
				email: 'user@example.com',
				password: 'Strong@123',
				role: 'ADMIN',
			})
		).toThrow();
	});
});

describe('AuthSchema.signUp()', () => {
	it('accepts valid input', () => {
		const result = AuthSchema.signUp.parse({
			firstName: 'Mohamed',
			lastName: 'Fathy',
			email: 'user@example.com',
			password: 'Strong@123',
			confirmPassword: 'Strong@123',
		});

		expect(result).toEqual({
			firstName: 'Mohamed',
			lastName: 'Fathy',
			email: 'user@example.com',
			password: 'Strong@123',
			confirmPassword: 'Strong@123',
		});
	});

	it('rejects confirmPassword when empty after trimming', () => {
		expect(() =>
			AuthSchema.signUp.parse({
				firstName: 'Mohamed',
				lastName: 'Fathy',
				email: 'user@example.com',
				password: 'Strong@123',
				confirmPassword: '   ',
			})
		).toThrow();
	});

	it('rejects unknown fields', () => {
		expect(() =>
			AuthSchema.signUp.parse({
				firstName: 'Mohamed',
				lastName: 'Fathy',
				email: 'user@example.com',
				password: 'Strong@123',
				confirmPassword: 'Strong@123',
				role: 'ADMIN',
			})
		).toThrow();
	});

	it('rejects input when confirmPassword is missing', () => {
		expect(() =>
			AuthSchema.signUp.parse({
				firstName: 'Mohamed',
				lastName: 'Fathy',
				email: 'user@example.com',
				password: 'Strong@123',
			})
		).toThrow();
	});

	it('rejects when password and confirmPassword do not match', () => {
		expect(() =>
			AuthSchema.signUp.parse({
				firstName: 'Mohamed',
				lastName: 'Fathy',
				email: 'user@example.com',
				password: 'Strong@123',
				confirmPassword: 'Wrong@123',
			})
		).toThrow();
	});
});

describe('AuthSchema.changePassword()', () => {
	it('accepts valid input', () => {
		const result = AuthSchema.changePassword.parse({
			currentPassword: 'Old@1234',
			newPassword: 'New@1234',
			confirmPassword: 'New@1234',
		});

		expect(result).toEqual({
			currentPassword: 'Old@1234',
			newPassword: 'New@1234',
			confirmPassword: 'New@1234',
		});
	});

	it('rejects when newPassword and confirmPassword do not match', () => {
		expect(() =>
			AuthSchema.changePassword.parse({
				currentPassword: 'Old@1234',
				newPassword: 'New@1234',
				confirmPassword: 'Mismatch',
			})
		).toThrow();
	});
});

describe('AuthSchema.changeEmail()', () => {
	it('accepts valid email', () => {
		const result = AuthSchema.changeEmail.parse({
			email: 'new@example.com',
		});

		expect(result).toEqual({ email: 'new@example.com' });
	});

	it('rejects unknown fields', () => {
		expect(() =>
			AuthSchema.changeEmail.parse({
				email: 'new@example.com',
				password: 'hack',
			})
		).toThrow();
	});
});
