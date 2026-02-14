import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import useUserActions from '../useUserActions';

vi.mock('../useUserMutations');

import useUserMutations from '../useUserMutations';

describe('useUserActions', () => {
	const mockUnwrap = vi.fn();
	const mockUpdateStatus = vi.fn();
	const mockDeleteUser = vi.fn();

	beforeEach(() => {
		vi.clearAllMocks();

		mockUpdateStatus.mockReturnValue({ unwrap: mockUnwrap });
		mockDeleteUser.mockReturnValue({ unwrap: mockUnwrap });

		(useUserMutations as any).mockReturnValue({
			updateStatus: mockUpdateStatus,
			deleteUser: mockDeleteUser,
			states: {
				updateStatus: { isLoading: false },
				deleteUser: { isLoading: false },
			},
		});
	});

	describe('activate', () => {
		it('calls updateStatus with isActive true and unwraps result', async () => {
			mockUnwrap.mockResolvedValueOnce('activated');

			const { result } = renderHook(() => useUserActions());

			const response = await result.current.activate('user-1');

			expect(mockUpdateStatus).toHaveBeenCalledWith('user-1', {
				isActive: true,
			});

			expect(mockUnwrap).toHaveBeenCalled();
			expect(response).toBe('activated');
		});
	});

	describe('deactivate', () => {
		it('calls updateStatus with isActive false and unwraps result', async () => {
			mockUnwrap.mockResolvedValueOnce('deactivated');

			const { result } = renderHook(() => useUserActions());

			const response = await result.current.deactivate('user-1');

			expect(mockUpdateStatus).toHaveBeenCalledWith('user-1', {
				isActive: false,
			});

			expect(mockUnwrap).toHaveBeenCalled();
			expect(response).toBe('deactivated');
		});
	});

	describe('remove', () => {
		it('calls deleteUser and unwraps result', async () => {
			mockUnwrap.mockResolvedValueOnce('deleted');

			const { result } = renderHook(() => useUserActions());

			const response = await result.current.remove('user-1');

			expect(mockDeleteUser).toHaveBeenCalledWith('user-1');
			expect(mockUnwrap).toHaveBeenCalled();
			expect(response).toBe('deleted');
		});
	});

	describe('derived loading state', () => {
		it('exposes isUpdatingStatus and isDeleting flags', () => {
			(useUserMutations as any).mockReturnValue({
				updateStatus: mockUpdateStatus,
				deleteUser: mockDeleteUser,
				states: {
					updateStatus: { isLoading: true },
					deleteUser: { isLoading: true },
				},
			});

			const { result } = renderHook(() => useUserActions());

			expect(result.current.isUpdatingStatus).toBe(true);
			expect(result.current.isDeleting).toBe(true);
		});
	});
});
