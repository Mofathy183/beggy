import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Response } from 'express';

import { envConfig, env } from '@config';
import { AuthCookies } from '@shared/utils';
import { Role } from '@beggy/shared/constants';

import { signAccessToken, signRefreshToken } from '@shared/utils/token.util';

vi.mock('@shared/utils/token.util', () => ({
	signAccessToken: vi.fn(),
	signRefreshToken: vi.fn(),
}));

const mockResponse = (): Response =>
	({
		cookie: vi.fn(),
		clearCookie: vi.fn(),
	}) as unknown as Response;

describe('AuthCookies', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('setAccessTokenCookie()', () => {
		it('sets access token cookie', () => {
			// Arrange
			(signAccessToken as any).mockReturnValue('access.jwt');
			const res = mockResponse();

			// Act
			AuthCookies.setAccessTokenCookie(res, 'user-id', Role.USER);

			// Assert
			expect(signAccessToken).toHaveBeenCalledWith('user-id', Role.USER);

			expect(res.cookie).toHaveBeenCalledWith(
				env.JWT_ACCESS_TOKEN_NAME,
				'access.jwt',
				envConfig.cookies.access
			);
		});
	});

	describe('setRefreshTokenCookie()', () => {
		it('sets refresh token cookie with standard lifetime', () => {
			// Arrange
			(signRefreshToken as any).mockReturnValue('refresh.jwt');
			const res = mockResponse();

			// Act
			AuthCookies.setRefreshTokenCookie(res, 'user-id');

			// Assert
			expect(signRefreshToken).toHaveBeenCalledWith('user-id', false);

			expect(res.cookie).toHaveBeenCalledWith(
				env.JWT_REFRESH_TOKEN_NAME,
				'refresh.jwt',
				{
					...envConfig.cookies.base,
					maxAge: env.JWT_REFRESH_MAX_AGE_MS,
				}
			);
		});

		it('sets refresh token cookie with remember-me lifetime', () => {
			// Arrange
			(signRefreshToken as any).mockReturnValue('refresh.jwt');
			const res = mockResponse();

			// Act
			AuthCookies.setRefreshTokenCookie(res, 'user-id', true);

			// Assert
			expect(signRefreshToken).toHaveBeenCalledWith('user-id', true);

			expect(res.cookie).toHaveBeenCalledWith(
				env.JWT_REFRESH_TOKEN_NAME,
				'refresh.jwt',
				{
					...envConfig.cookies.base,
					maxAge: env.JWT_REFRESH_REMEMBER_MAX_AGE_MS,
				}
			);
		});
	});

	describe('setCookies()', () => {
		it('sets access and refresh cookies', () => {
			// Arrange
			(signAccessToken as any).mockReturnValue('access.jwt');
			(signRefreshToken as any).mockReturnValue('refresh.jwt');
			const res = mockResponse();

			// Act
			AuthCookies.setCookies(res, 'user-id', Role.USER, true);

			// Assert
			expect(signAccessToken).toHaveBeenCalled();
			expect(signRefreshToken).toHaveBeenCalled();

			expect(res.cookie).toHaveBeenCalledTimes(2);
		});
	});

	describe('clear()', () => {
		it('clears access and refresh cookies', () => {
			// Arrange
			const res = mockResponse();

			// Act
			AuthCookies.clear(res);

			// Assert
			expect(res.clearCookie).toHaveBeenCalledWith(
				env.JWT_ACCESS_TOKEN_NAME
			);

			expect(res.clearCookie).toHaveBeenCalledWith(
				env.JWT_REFRESH_TOKEN_NAME
			);
		});
	});
});
