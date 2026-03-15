import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';

import useUserActions from '../useUserActions';
import useUserMutations from '../useUserMutations';

vi.mock('../useUserMutations');

describe('useUserActions', () => {
	const mockUpdateUnwrap = vi.fn();
	const mockDeleteUnwrap = vi.fn();

	const mockUpdateStatus = vi.fn();
	const mockDeleteUser = vi.fn();

	beforeEach(() => {
		vi.clearAllMocks();

		mockUpdateStatus.mockReturnValue({
			unwrap: mockUpdateUnwrap,
		});

		mockDeleteUser.mockReturnValue({
			unwrap: mockDeleteUnwrap,
		});

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
		it('activates a user and returns the mutation result', async () => {
			mockUpdateUnwrap.mockResolvedValueOnce('activated');

			const { result } = renderHook(() => useUserActions());

			const response = await result.current.activate('user-1');

			expect(mockUpdateStatus).toHaveBeenCalledWith('user-1', {
				isActive: true,
			});

			expect(mockUpdateUnwrap).toHaveBeenCalled();
			expect(response).toBe('activated');
		});

		it('throws an error when user activation fails', async () => {
			const error = new Error('mutation failed');

			mockUpdateUnwrap.mockRejectedValueOnce(error);

			const { result } = renderHook(() => useUserActions());

			await expect(result.current.activate('user-1')).rejects.toThrow(
				error
			);
		});
	});

	describe('deactivate', () => {
		it('deactivates a user and returns the mutation result', async () => {
			mockUpdateUnwrap.mockResolvedValueOnce('deactivated');

			const { result } = renderHook(() => useUserActions());

			const response = await result.current.deactivate('user-1');

			expect(mockUpdateStatus).toHaveBeenCalledWith('user-1', {
				isActive: false,
			});

			expect(mockUpdateUnwrap).toHaveBeenCalled();
			expect(response).toBe('deactivated');
		});
	});

	describe('remove', () => {
		it('deletes a user and returns the mutation result', async () => {
			mockDeleteUnwrap.mockResolvedValueOnce('deleted');

			const { result } = renderHook(() => useUserActions());

			const response = await result.current.remove('user-1');

			expect(mockDeleteUser).toHaveBeenCalledWith('user-1');

			expect(mockDeleteUnwrap).toHaveBeenCalled();
			expect(response).toBe('deleted');
		});
	});

	describe('loading state', () => {
		it('exposes loading flags from the mutation states', () => {
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
