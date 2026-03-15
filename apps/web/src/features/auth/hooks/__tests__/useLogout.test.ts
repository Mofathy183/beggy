import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';

import { clearPermissions } from '@shared/store/ability';
import { authApi } from '@features/auth/api';
import { SuccessMessages } from '@beggy/shared/constants';

const replaceMock = vi.fn();
const dispatchMock = vi.fn();
const logoutMock = vi.fn();

vi.mock('next/navigation', () => ({
	useRouter: () => ({
		replace: replaceMock,
	}),
}));

vi.mock('@shared/store', () => ({
	useAppDispatch: () => dispatchMock,
}));

vi.mock('@features/auth/api', () => ({
	useLogoutMutation: () => [
		vi.fn(() => ({
			unwrap: logoutMock,
		})),
	],
	authApi: {
		util: {
			resetApiState: vi.fn(() => ({ type: 'resetApiState' })),
		},
	},
}));

import useLogout from '../useLogout';

describe('useLogout', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('logs out successfully and calls the success callback', async () => {
		logoutMock.mockResolvedValueOnce(undefined);

		const onSuccess = vi.fn();

		const { result } = renderHook(() => useLogout());

		await act(async () => {
			await result.current({ onSuccess });
		});

		expect(logoutMock).toHaveBeenCalled();

		expect(onSuccess).toHaveBeenCalledWith(SuccessMessages.LOGOUT_SUCCESS);

		expect(dispatchMock).toHaveBeenCalledWith(clearPermissions());

		expect(dispatchMock).toHaveBeenCalledWith(authApi.util.resetApiState());

		expect(replaceMock).toHaveBeenCalledWith('/login');
	});

	it('calls the error callback when logout fails but still clears client state', async () => {
		const error = new Error('network error');

		logoutMock.mockRejectedValueOnce(error);

		const onError = vi.fn();

		const { result } = renderHook(() => useLogout());

		await act(async () => {
			await result.current({ onError });
		});

		expect(logoutMock).toHaveBeenCalled();

		expect(onError).toHaveBeenCalledWith(error);

		expect(dispatchMock).toHaveBeenCalledWith(clearPermissions());

		expect(dispatchMock).toHaveBeenCalledWith(authApi.util.resetApiState());

		expect(replaceMock).toHaveBeenCalledWith('/login');
	});
});
