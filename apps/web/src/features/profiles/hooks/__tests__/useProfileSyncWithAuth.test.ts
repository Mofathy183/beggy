import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import useProfileSyncWithAuth from '../useProfileSyncWithAuth';
import { useAppDispatch } from '@shared/store';

vi.mock('@shared/store');

describe('useProfileSyncWithAuth', () => {
	const mockDispatch = vi.fn();

	beforeEach(() => {
		vi.clearAllMocks();
		(useAppDispatch as any).mockReturnValue(mockDispatch);
	});

	it('syncs profile when syncProfile is called', () => {
		const { result } = renderHook(() => useProfileSyncWithAuth());

		act(() => {
			result.current.syncProfile();
		});

		expect(mockDispatch).toHaveBeenCalledTimes(1);

		const dispatchedArg = (mockDispatch.mock as any).calls[0][0];
		expect(typeof dispatchedArg).toBe('function');
	});

	it('returns syncProfile function', () => {
		const { result } = renderHook(() => useProfileSyncWithAuth());

		expect(typeof result.current.syncProfile).toBe('function');
	});
});
