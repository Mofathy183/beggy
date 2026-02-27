import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';

import { clearPermissions } from '@shared/store/ability';
import { authApi } from '@features/auth';

const replaceMock = vi.fn();
const dispatchMock = vi.fn();
const logoutMock = vi.fn();

vi.mock('next/navigation', () => ({
	useRouter: () => ({
		replace: replaceMock,
	}),
}));

vi.mock('@shared/store/store', () => ({
	useAppDispatch: () => dispatchMock,
}));

vi.mock('@features/auth/api', async () => {
	const actual = await vi.importActual<any>('@features/auth/api');

	return {
		...actual,
		useLogoutMutation: () => [
			vi.fn(() => ({
				unwrap: () => logoutMock(),
			})),
		],
	};
});

import useLogout from '../useLogout';

describe('useLogout()', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('when logout succeeds', () => {
		it('clears client state and redirects to login', async () => {
			logoutMock.mockResolvedValueOnce(undefined);

			const { result } = renderHook(() => useLogout());

			await act(async () => {
				await result.current();
			});

			expect(logoutMock).toHaveBeenCalled();

			expect(dispatchMock).toHaveBeenCalledWith(clearPermissions());
			expect(dispatchMock).toHaveBeenCalledWith(
				authApi.util.resetApiState()
			);

			expect(replaceMock).toHaveBeenCalledWith('/login');
		});
	});

	describe('when logout fails', () => {
		it('clears client state and redirects to login', async () => {
			logoutMock.mockRejectedValueOnce(new Error('network error'));

			const { result } = renderHook(() => useLogout());

			await act(async () => {
				await result.current();
			});

			expect(logoutMock).toHaveBeenCalled();

			expect(dispatchMock).toHaveBeenCalledWith(clearPermissions());
			expect(dispatchMock).toHaveBeenCalledWith(
				authApi.util.resetApiState()
			);

			expect(replaceMock).toHaveBeenCalledWith('/login');
		});
	});
});
