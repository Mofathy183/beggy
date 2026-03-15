import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';

import useProfileSyncWithAuth from '../useProfileSyncWithAuth';
import { useAppDispatch } from '@shared/store';
import { authApi } from '@features/auth/api';

vi.mock('@shared/store', () => ({
	useAppDispatch: vi.fn(),
}));

vi.mock('@features/auth/api', () => ({
	authApi: {
		endpoints: {
			me: {
				initiate: vi.fn(() => ({ type: 'auth/me' })),
			},
		},
	},
}));

describe('useProfileSyncWithAuth', () => {
	const mockDispatch = vi.fn();

	beforeEach(() => {
		vi.clearAllMocks();
		(useAppDispatch as any).mockReturnValue(mockDispatch);
	});

	it('refetches the authenticated user when syncProfile is called', () => {
		const { result } = renderHook(() => useProfileSyncWithAuth());

		act(() => {
			result.current.syncProfile();
		});

		expect(authApi.endpoints.me.initiate).toHaveBeenCalledWith(undefined, {
			forceRefetch: true,
		});

		expect(mockDispatch).toHaveBeenCalledTimes(1);
	});

	it('exposes the syncProfile function', () => {
		const { result } = renderHook(() => useProfileSyncWithAuth());

		expect(typeof result.current.syncProfile).toBe('function');
	});
});
