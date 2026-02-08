import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';

import useLogout from '../useLogout';
import { clearPermissions } from '@shared/store/ability';
import { authApi } from '@features/auth';

const replaceMock = vi.fn();

vi.mock('next/navigation', () => ({
	useRouter: () => ({
		replace: replaceMock,
	}),
}));

const dispatchMock = vi.fn();

vi.mock('@shared/store/store', () => ({
	useAppDispatch: () => dispatchMock,
}));

const logoutMock = vi.fn();

vi.mock('@features/auth/auth.api', async () => {
	const actual = await vi.importActual<any>('@features/auth/auth.api');

	return {
		...actual,
		authApi: {
			...actual.authApi,
			useLogoutMutation: () => [
				() => ({
					unwrap: logoutMock,
				}),
			],
			util: {
				resetApiState: vi.fn(() => ({
					type: 'auth/resetApiState',
				})),
			},
		},
	};
});

describe('useLogout()', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('clears client state and redirects when logout succeeds', async () => {
		logoutMock.mockResolvedValueOnce(undefined);

		const { result } = renderHook(() => useLogout());

		await act(async () => {
			await result.current();
		});

		expect(logoutMock).toHaveBeenCalled();
		expect(dispatchMock).toHaveBeenCalledWith(clearPermissions());
		expect(dispatchMock).toHaveBeenCalledWith(authApi.util.resetApiState());
		expect(replaceMock).toHaveBeenCalledWith('/login');
	});

	it('clears client state and redirects even when logout fails', async () => {
		logoutMock.mockRejectedValueOnce(new Error('network error'));

		const { result } = renderHook(() => useLogout());

		await act(async () => {
			await result.current();
		});

		expect(logoutMock).toHaveBeenCalled();
		expect(dispatchMock).toHaveBeenCalledWith(clearPermissions());
		expect(dispatchMock).toHaveBeenCalledWith(authApi.util.resetApiState());
		expect(replaceMock).toHaveBeenCalledWith('/login');
	});
});
