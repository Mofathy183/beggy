import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';

import useUserActions from '../useUserActions';
import useUserMutations from '../useUserMutations';
import { notify } from '@shared/utils/notify.utils';

vi.mock('../useUserMutations');

vi.mock('@shared/utils/notify.utils', () => ({
	notify: {
		error: Object.assign(vi.fn(), {
			fromHttp: vi.fn(),
		}),
	},
}));

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
		it('calls updateStatus with active=true and triggers success callback', async () => {
			const onSuccess = vi.fn();

			mockUpdateUnwrap.mockResolvedValueOnce(undefined);

			const { result } = renderHook(() => useUserActions());

			await result.current.activate('user-1', { onSuccess });

			expect(mockUpdateStatus).toHaveBeenCalledWith('user-1', {
				isActive: true,
			});

			expect(onSuccess).toHaveBeenCalled();
		});

		it('calls onError and shows notification when activation fails', async () => {
			const error = new Error('mutation failed');
			const onError = vi.fn();

			mockUpdateUnwrap.mockRejectedValueOnce(error);

			const { result } = renderHook(() => useUserActions());

			await result.current.activate('user-1', { onError });

			expect(onError).toHaveBeenCalledWith(error);
			expect(notify.error.fromHttp).toHaveBeenCalledWith(error);
		});
	});

	describe('deactivate', () => {
		it('calls updateStatus with active=false and triggers success callback', async () => {
			const onSuccess = vi.fn();

			mockUpdateUnwrap.mockResolvedValueOnce(undefined);

			const { result } = renderHook(() => useUserActions());

			await result.current.deactivate('user-1', { onSuccess });

			expect(mockUpdateStatus).toHaveBeenCalledWith('user-1', {
				isActive: false,
			});

			expect(onSuccess).toHaveBeenCalled();
		});
	});

	describe('remove', () => {
		it('calls deleteUser and triggers success callback', async () => {
			const onSuccess = vi.fn();

			mockDeleteUnwrap.mockResolvedValueOnce(undefined);

			const { result } = renderHook(() => useUserActions());

			await result.current.remove('user-1', { onSuccess });

			expect(mockDeleteUser).toHaveBeenCalledWith('user-1');
			expect(onSuccess).toHaveBeenCalled();
		});

		it('calls onError and shows notification when deletion fails', async () => {
			const error = new Error('delete failed');
			const onError = vi.fn();

			mockDeleteUnwrap.mockRejectedValueOnce(error);

			const { result } = renderHook(() => useUserActions());

			await result.current.remove('user-1', { onError });

			expect(onError).toHaveBeenCalledWith(error);
			expect(notify.error.fromHttp).toHaveBeenCalledWith(error);
		});
	});

	describe('loading state', () => {
		it('exposes loading flags from mutation state', () => {
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
			expect(result.current.isAnyLoading).toBe(true);
		});
	});
});
