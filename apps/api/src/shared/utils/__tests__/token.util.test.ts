import { describe, it, expect, vi, beforeEach } from 'vitest';

import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { differenceInMinutes } from 'date-fns';
import { ParamsSchema } from '@beggy/shared/schemas/api.schema';
import { FieldsSchema } from '@beggy/shared/schemas/fields.schema';

import {
	signAccessToken,
	signRefreshToken,
	verifyAccessToken,
	verifyRefreshToken,
	hashToken,
	generateEmailVerificationToken,
	setExpiredAt,
} from '@shared/utils';
import { Role, TokenType } from '@prisma-generated/enums';

vi.mock('jsonwebtoken', () => ({
	default: {
		sign: vi.fn(),
		verify: vi.fn(),
	},
}));

vi.mock('@shared/utils/app-error.util', () => ({
	appErrorMap: {
		badRequest: vi.fn((code, error) => ({ code, error })),
		unauthorized: vi.fn((code, error) => ({ code, error })),
	},
}));

const mockJwtPayload = (overrides: Partial<any> = {}) => ({
	sub: 'user-id',
	role: Role.USER,
	iat: 123456789,
	...overrides,
});

beforeEach(() => {
	vi.clearAllMocks();

	vi.spyOn(ParamsSchema.uuid, 'safeParse').mockReturnValue({
		success: true,
		data: { id: 'user-id' },
	} as any);

	vi.spyOn(FieldsSchema, 'enum').mockReturnValue({
		safeParse: vi.fn().mockReturnValue({
			success: true,
			data: Role.USER,
		}),
	} as any);
});

describe('JWT tokens', () => {
	describe('signAccessToken()', () => {
		it('returns a signed access token', () => {
			(jwt.sign as any).mockReturnValue('access.jwt');

			const result = signAccessToken('user-id', Role.USER);

			expect(result).toBe('access.jwt');
			expect(jwt.sign).toHaveBeenCalledWith(
				{
					sub: 'user-id',
					role: Role.USER,
				},
				expect.anything(),
				expect.anything()
			);
		});
	});

	describe('signRefreshToken()', () => {
		it('returns a signed refresh token with standard expiry', () => {
			(jwt.sign as any).mockReturnValue('refresh.jwt');

			const result = signRefreshToken('user-id');

			expect(result).toBe('refresh.jwt');
			expect(jwt.sign).toHaveBeenCalledWith(
				{ sub: 'user-id' },
				expect.anything(),
				expect.objectContaining({
					expiresIn: expect.anything(),
				})
			);
		});

		it('returns a signed refresh token with extended expiry', () => {
			(jwt.sign as any).mockReturnValue('refresh.jwt');

			signRefreshToken('user-id', true);

			expect(jwt.sign).toHaveBeenCalledWith(
				{ sub: 'user-id' },
				expect.anything(),
				expect.objectContaining({
					expiresIn: expect.anything(),
				})
			);
		});
	});

	describe('verifyAccessToken()', () => {
		it('returns verified access token identity', () => {
			(jwt.verify as any).mockReturnValue(mockJwtPayload());

			const result = verifyAccessToken('access.jwt');

			expect(result).toEqual({
				id: 'user-id',
				role: Role.USER,
				issuedAt: 123456789,
			});
		});

		it('throws when token is invalid', () => {
			(jwt.verify as any).mockImplementation(() => {
				throw new Error('invalid');
			});

			expect(() => verifyAccessToken('bad.jwt')).toThrow();
		});

		it('throws when subject is invalid', () => {
			(jwt.verify as any).mockReturnValue(mockJwtPayload());

			vi.spyOn(ParamsSchema.uuid, 'safeParse').mockReturnValue({
				success: false,
			} as any);

			expect(() => verifyAccessToken('access.jwt')).toThrow();
		});

		it('throws when role is invalid', () => {
			(jwt.verify as any).mockReturnValue(mockJwtPayload());

			vi.spyOn(FieldsSchema, 'enum').mockReturnValue({
				safeParse: vi.fn().mockReturnValue({ success: false }),
			} as any);

			expect(() => verifyAccessToken('access.jwt')).toThrow();
		});

		it('throws when role is missing', () => {
			(jwt.verify as any).mockReturnValue({
				sub: 'user-id',
				iat: 123456789,
			});

			vi.spyOn(ParamsSchema.uuid, 'safeParse').mockReturnValue({
				success: false,
			} as any);

			expect(() => verifyAccessToken('access.jwt')).toThrow();
		});

		it('throws when issuedAt is missing', () => {
			(jwt.verify as any).mockReturnValue(
				mockJwtPayload({ iat: undefined })
			);

			expect(() => verifyAccessToken('access.jwt')).toThrow();
		});
	});

	describe('verifyRefreshToken()', () => {
		it('returns verified refresh token identity', () => {
			(jwt.verify as any).mockReturnValue({
				sub: 'user-id',
				iat: 123456789,
			});

			const result = verifyRefreshToken('refresh.jwt');

			expect(result).toEqual({
				id: 'user-id',
				issuedAt: 123456789,
			});
		});

		it('throws when token is invalid', () => {
			(jwt.verify as any).mockImplementation(() => {
				throw new Error('invalid');
			});

			expect(() => verifyRefreshToken('bad.jwt')).toThrow();
		});

		it('throws when subject is invalid', () => {
			(jwt.verify as any).mockReturnValue({
				sub: 'bad-id',
				iat: 123,
			});

			vi.spyOn(ParamsSchema.uuid, 'safeParse').mockReturnValue({
				success: false,
			} as any);

			expect(() => verifyRefreshToken('refresh.jwt')).toThrow();
		});

		it('throws when issuedAt is missing', () => {
			(jwt.verify as any).mockReturnValue({ sub: 'user-id' });

			expect(() => verifyRefreshToken('refresh.jwt')).toThrow();
		});
	});
});

describe('hashToken()', () => {
	it('returns a hashed token', () => {
		const hash = hashToken('plain-token');

		expect(typeof hash).toBe('string');
		expect(hash).not.toBe('plain-token');
	});

	it('returns the same hash for the same input', () => {
		const hash1 = hashToken('same-token');
		const hash2 = hashToken('same-token');

		expect(hash1).toBe(hash2);
	});

	it('throws when token is missing', () => {
		expect(() => hashToken('')).toThrow();
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
