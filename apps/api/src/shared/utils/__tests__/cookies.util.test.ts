import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Response } from 'express';

import { envConfig, env } from '@config';
import { setAuthCookies, clearAuthCookies } from '@shared/utils';
import { Role } from '@beggy/shared/constants';

vi.mock('@shared/utils/password.util', async () => {
	const actual =
		await vi.importActual<typeof import('@shared/utils')>('@shared/utils');

	return {
		...actual,
		hashPassword: vi.fn().mockResolvedValue('hashed-password'),
	};
});

vi.mock('@shared/utils/token.util', () => ({
	signAccessToken: vi.fn(),
	signRefreshToken: vi.fn(),
}));

import { signAccessToken, signRefreshToken } from '@shared/utils';

const mockResponse = (): Response =>
	({
		cookie: vi.fn(),
		clearCookie: vi.fn(),
	}) as unknown as Response;

describe('setAuthCookies()', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('sets access and refresh auth cookies', () => {
		(signAccessToken as any).mockReturnValue('access.jwt');
		(signRefreshToken as any).mockReturnValue('refresh.jwt');

		const res = mockResponse();

		setAuthCookies(res, 'user-id', Role.USER);

		expect(signAccessToken).toHaveBeenCalledWith('user-id', Role.USER);

		expect(signRefreshToken).toHaveBeenCalledWith('user-id');

		expect(res.cookie).toHaveBeenCalledWith(
			env.JWT_ACCESS_TOKEN_NAME,
			'access.jwt',
			envConfig.cookies.access
		);

		expect(res.cookie).toHaveBeenCalledWith(
			env.JWT_REFRESH_TOKEN_NAME,
			'refresh.jwt',
			envConfig.cookies.refresh
		);
	});
});

describe('clearAuthCookies()', () => {
	it('clears access and refresh cookies', () => {
		const res = mockResponse();

		clearAuthCookies(res);

		expect(res.clearCookie).toHaveBeenCalledWith(
			env.JWT_ACCESS_TOKEN_NAME,
			// 'access.jwt',
			envConfig.cookies.access
		);

		expect(res.clearCookie).toHaveBeenCalledWith(
			env.JWT_REFRESH_TOKEN_NAME,
			// 'refresh.jwt',
			envConfig.cookies.refresh
		);
	});
});
