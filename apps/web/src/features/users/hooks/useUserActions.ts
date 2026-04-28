import { useCallback } from 'react';
import useUserMutations from './useUserMutations';
import { notify } from '@shared/utils/notify.utils';
import type { HttpClientError } from '@shared/types';

type CallbackOptions = {
	onSuccess?: () => void;
	onError?: (err: unknown) => void;
};

/**
 * Domain-level user actions built on top of mutation hooks.
 *
 * This hook acts as an abstraction layer between UI components
 * and API mutations, providing business-oriented operations.
 *
 * @returns User action handlers and related loading states.
 */
const useUserActions = () => {
	const { updateStatus, deleteUser, states } = useUserMutations();

	const activate = useCallback(
		async (id: string, callbacks?: CallbackOptions) => {
			try {
				await updateStatus(id, { isActive: true }).unwrap();
				callbacks?.onSuccess?.();
			} catch (err) {
				callbacks?.onError?.(err);
				notify.error.fromHttp(err as HttpClientError);
			}
		},
		[updateStatus]
	);

	const deactivate = useCallback(
		async (id: string, callbacks?: CallbackOptions) => {
			try {
				await updateStatus(id, { isActive: false }).unwrap();
				callbacks?.onSuccess?.();
			} catch (err) {
				callbacks?.onError?.(err);
				notify.error.fromHttp(err as HttpClientError);
			}
		},
		[updateStatus]
	);

	const remove = useCallback(
		async (id: string, callbacks?: CallbackOptions) => {
			try {
				await deleteUser(id).unwrap();
				callbacks?.onSuccess?.();
			} catch (err) {
				callbacks?.onError?.(err);
				notify.error.fromHttp(err as HttpClientError);
			}
		},
		[deleteUser]
	);

	return {
		activate,
		deactivate,
		remove,
		isUpdatingStatus: states.updateStatus.isLoading,
		isDeleting: states.deleteUser.isLoading,
		isAnyLoading:
			states.updateStatus.isLoading || states.deleteUser.isLoading,
		states,
	};
};

export default useUserActions;
