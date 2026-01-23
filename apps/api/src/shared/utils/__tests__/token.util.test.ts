import { describe, it, expect, vi, beforeEach } from 'vitest';

import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { differenceInMinutes } from 'date-fns';

import { envConfig } from '@config';
import {
	signAccessToken,
	signRefreshToken,
	verifyAccessToken,
	verifyRefreshToken,
	generatePasswordResetToken,
	generateEmailVerificationToken,
	setExpiredAt,
} from '@shared/utils';
import { Role, TokenType } from '@beggy/shared/constants';

const MOCK_USER_ID = crypto.randomUUID();

const MOCK_INVALID_USER_ID = 'not-a-uuid';

describe('signAccessToken()', () => {
	it('returns a signed JWT', () => {
		const token = signAccessToken(MOCK_USER_ID, Role.USER);
		expect(typeof token).toBe('string');
		expect(token.split('.')).toHaveLength(3);
	});

	it('embeds the user id as subject', () => {
		const token = signAccessToken(MOCK_USER_ID, Role.USER);

		const payload = jwt.verify(
			token,
			envConfig.security.jwt.access.secret
		) as jwt.JwtPayload;

		expect(payload.sub).toBe(MOCK_USER_ID);
	});

	it('embeds the user role', () => {
		const token = signAccessToken(MOCK_USER_ID, Role.ADMIN);

		const payload = jwt.verify(
			token,
			envConfig.security.jwt.access.secret
		) as jwt.JwtPayload;

		expect(payload.role).toBe(Role.ADMIN);
	});
});

describe('signRefreshToken()', () => {
	it('returns a signed JWT', () => {
		const token = signRefreshToken(MOCK_USER_ID);

		expect(typeof token).toBe('string');
		expect(token.split('.')).toHaveLength(3);
	});

	it('embeds the user id as subject', () => {
		const token = signRefreshToken(MOCK_USER_ID);

		const payload = jwt.verify(
			token,
			envConfig.security.jwt.refresh.secret
		) as jwt.JwtPayload;

		expect(payload.sub).toBe(MOCK_USER_ID);
	});

	it('does not include a role claim', () => {
		const token = signRefreshToken(MOCK_USER_ID);

		const payload = jwt.verify(
			token,
			envConfig.security.jwt.refresh.secret
		) as jwt.JwtPayload;

		expect(payload.role).toBeUndefined();
	});
});

describe('verifyAccessToken()', () => {
	it('returns verified identity data for a valid token', () => {
		const token = signAccessToken(MOCK_USER_ID, Role.USER);

		const result = verifyAccessToken(token);

		expect(result).toEqual({
			id: MOCK_USER_ID,
			role: Role.USER,
			issuedAt: expect.any(Number),
		});
	});

	it('throws when token is invalid', () => {
		expect(() => verifyAccessToken('invalid.token.value')).toThrow();
	});

	it('throws when subject is invalid', () => {
		const token = jwt.sign(
			{ sub: MOCK_INVALID_USER_ID, role: Role.USER },
			envConfig.security.jwt.access.secret,
			envConfig.security.jwt.access.config
		);

		expect(() => verifyAccessToken(token)).toThrow();
	});

	it('throws when role is invalid', () => {
		const token = jwt.sign(
			{ sub: MOCK_USER_ID, role: 'HACKER' },
			envConfig.security.jwt.access.secret,
			envConfig.security.jwt.access.config
		);

		expect(() => verifyAccessToken(token)).toThrow();
	});

	it('throws when issued at is missing', () => {
		const token = jwt.sign(
			{ sub: MOCK_USER_ID, role: Role.USER },
			envConfig.security.jwt.access.secret,
			{ ...envConfig.security.jwt.access.config, noTimestamp: true }
		);

		expect(() => verifyAccessToken(token)).toThrow();
	});
});

describe('verifyRefreshToken()', () => {
	it('returns verified identity data for a valid token', () => {
		const token = signRefreshToken(MOCK_USER_ID);

		const result = verifyRefreshToken(token);

		expect(result).toEqual({
			id: MOCK_USER_ID,
			issuedAt: expect.any(Number),
		});
	});

	it('throws when token is invalid', () => {
		expect(() => verifyRefreshToken('invalid.token.value')).toThrow();
	});

	it('throws when subject is invalid', () => {
		const token = jwt.sign(
			{ sub: MOCK_INVALID_USER_ID },
			envConfig.security.jwt.refresh.secret,
			envConfig.security.jwt.refresh.config
		);

		expect(() => verifyRefreshToken(token)).toThrow();
	});

	it('throws when issued at is missing', () => {
		const token = jwt.sign(
			{ sub: MOCK_USER_ID },
			envConfig.security.jwt.refresh.secret,
			{ ...envConfig.security.jwt.refresh.config, noTimestamp: true }
		);

		expect(() => verifyRefreshToken(token)).toThrow();
	});
});

describe('generatePasswordResetToken()', () => {
	it('returns a hashed token', () => {
		const hash = generatePasswordResetToken('plain-token');

		expect(typeof hash).toBe('string');
		expect(hash).not.toBe('plain-token');
	});

	it('returns the same hash for the same input', () => {
		const hash1 = generatePasswordResetToken('same-token');
		const hash2 = generatePasswordResetToken('same-token');

		expect(hash1).toBe(hash2);
	});

	it('throws when token is missing', () => {
		expect(() => generatePasswordResetToken('')).toThrow();
	});
});

describe('generateEmailVerificationToken()', () => {
	it('returns a token and a hash', () => {
		const result = generateEmailVerificationToken();

		expect(result).toHaveProperty('token');
		expect(result).toHaveProperty('hash');
	});

	it('returns different values for token and hash', () => {
		const { token, hash } = generateEmailVerificationToken();

		expect(token).not.toBe(hash);
	});

	it('returns a hash that matches the token', () => {
		const { token, hash } = generateEmailVerificationToken();

		const expectedHash = crypto
			.createHash('sha256')
			.update(token)
			.digest('hex');

		expect(hash).toBe(expectedHash);
	});
});

describe('setExpiredAt()', () => {
	beforeEach(() => {
		vi.useFakeTimers();
		vi.setSystemTime(new Date('2025-01-01T00:00:00Z'));
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it('returns a date 24 hours in the future for email verification', () => {
		const expiresAt = setExpiredAt(TokenType.EMAIL_VERIFICATION);

		const diff = differenceInMinutes(expiresAt, new Date());

		expect(diff).toBe(60 * 24);
	});

	it('returns a date 60 minutes in the future for change email', () => {
		const expiresAt = setExpiredAt(TokenType.CHANGE_EMAIL);

		const diff = differenceInMinutes(expiresAt, new Date());

		expect(diff).toBe(60);
	});

	it('returns a date 15 minutes in the future for password reset', () => {
		const expiresAt = setExpiredAt(TokenType.PASSWORD_RESET);

		const diff = differenceInMinutes(expiresAt, new Date());

		expect(diff).toBe(15);
	});
});
