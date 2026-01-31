import type { Request, Response, NextFunction } from 'express';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
	authCookieParser,
	requireAuth,
	requireRefreshToken,
} from '@shared/middlewares';

import { defineAbilityFor } from '@shared/middlewares/permission.middleware';
import {
	verifyAccessToken,
	verifyRefreshToken,
} from '@shared/utils/token.util';

vi.mock('@shared/utils/token.util', () => ({
	verifyAccessToken: vi.fn(),
	verifyRefreshToken: vi.fn(),
}));

vi.mock('@shared/middlewares/permission.middleware', () => ({
	defineAbilityFor: vi.fn(),
}));

describe('authCookieParser', () => {
	let req: Partial<Request>;
	let res: Partial<Response>;
	let next: NextFunction;

	beforeEach(() => {
		req = {
			cookies: {
				accessToken: 'access-token',
				refreshToken: 'refresh-token',
			},
		};

		res = {};
		next = vi.fn();
	});

	it('extracts auth tokens from cookies', () => {
		// Act
		authCookieParser(req as Request, res as Response, next);

		// Assert
		expect(req.authTokens).toEqual({
			accessToken: 'access-token',
			refreshToken: 'refresh-token',
		});

		expect(next).toHaveBeenCalledOnce();
	});

	it('returns empty auth tokens when cookies are missing', () => {
		// Arrange
		req = {};

		// Act
		authCookieParser(req as Request, res as Response, next);

		// Assert
		expect(req.authTokens).toEqual({
			accessToken: undefined,
			refreshToken: undefined,
		});

		expect(next).toHaveBeenCalledOnce();
	});
});

describe('requireAuth', () => {
	let req: Partial<Request>;
	let res: Partial<Response>;
	let next: NextFunction;

	beforeEach(() => {
		req = {};
		res = {};
		next = vi.fn();

		vi.clearAllMocks();
	});

	it('throws when access token is missing', () => {
		// Act + Assert
		expect(() =>
			requireAuth(req as Request, res as Response, next)
		).toThrow();

		expect(next).not.toHaveBeenCalled();
	});

	describe('when access token is present', () => {
		it('allows requests with a valid access token', () => {
			// Arrange
			req.authTokens = {
				accessToken: 'valid-token',
				refreshToken: 'valid-refresh-token',
			};

			(verifyAccessToken as any).mockReturnValue({
				id: 'user-id',
				role: 'ADMIN',
				issuedAt: 123456,
			});

			(defineAbilityFor as any).mockReturnValue('mock-ability');

			// Act
			requireAuth(req as Request, res as Response, next);

			// Assert
			expect(verifyAccessToken).toHaveBeenCalledWith('valid-token');

			expect(req.user).toEqual({
				id: 'user-id',
				role: 'ADMIN',
				issuedAt: 123456,
			});

			expect(req.ability).toBe('mock-ability');
			expect(next).toHaveBeenCalledOnce();
		});

		it('passes token verification errors to next', () => {
			// Arrange
			req.authTokens = {
				accessToken: 'invalid-token',
				refreshToken: 'valid-refresh-token',
			};

			const error = new Error('Invalid token');
			(verifyAccessToken as any).mockImplementation(() => {
				throw error;
			});

			// Act
			requireAuth(req as Request, res as Response, next);

			// Assert
			expect(next).toHaveBeenCalledWith(error);
		});
	});
});

describe('requireRefreshToken', () => {
	let req: Partial<Request>;
	let res: Partial<Response>;
	let next: NextFunction;

	beforeEach(() => {
		req = {};
		res = {};
		next = vi.fn();

		vi.clearAllMocks();
	});

	it('throws when refresh token is missing', () => {
		// Arrange
		req.authTokens = {
			accessToken: 'access-token',
			refreshToken: '',
		};

		// Act + Assert
		expect(() =>
			requireRefreshToken(req as Request, res as Response, next)
		).toThrow();

		expect(verifyRefreshToken).not.toHaveBeenCalled();
		expect(next).not.toHaveBeenCalled();
	});

	describe('when refresh token is present', () => {
		it('allows requests with a valid refresh token', () => {
			// Arrange
			req.authTokens = {
				accessToken: 'access-token',
				refreshToken: 'valid-refresh-token',
			};

			(verifyRefreshToken as any).mockReturnValue({
				id: 'user-id',
			});

			// Act
			requireRefreshToken(req as Request, res as Response, next);

			// Assert
			expect(verifyRefreshToken).toHaveBeenCalledWith(
				'valid-refresh-token'
			);

			expect(req.refreshPayload).toEqual({
				userId: 'user-id',
			});

			expect(next).toHaveBeenCalledOnce();
		});

		it('passes token verification errors to next', () => {
			// Arrange
			req.authTokens = {
				accessToken: 'access-token',
				refreshToken: 'invalid-refresh-token',
			};

			const error = new Error('Invalid refresh token');
			(verifyRefreshToken as any).mockImplementation(() => {
				throw error;
			});

			// Act
			requireRefreshToken(req as Request, res as Response, next);

			// Assert
			expect(verifyRefreshToken).toHaveBeenCalledWith(
				'invalid-refresh-token'
			);
			expect(next).toHaveBeenCalledWith(error);
			expect(req.refreshPayload).toBeUndefined();
		});
	});
});
