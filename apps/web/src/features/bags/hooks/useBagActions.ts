import { useCallback } from 'react';
import useBagMutations from './useBagMutations';
import type { CreateBagInput, UpdateBagInput } from '@beggy/shared/types';
import { SuccessMessages } from '@beggy/shared/constants';
import type { HttpClientError } from '@/shared/types';

/**
 * Optional callbacks executed after a mutation attempt.
 */
type CallbackOptions = {
	/** Invoked when the mutation completes successfully. */
	onSuccess?: (message: string) => void;

	/** Invoked when the mutation fails. */
	onError?: (err: unknown) => void;
};

/**
 * Feature-level action hook for Bag mutations.
 *
 * @description
 * Provides UI-friendly wrappers around bag mutations
 * (create, update, delete) with built-in error handling
 * and optional lifecycle callbacks.
 *
 * @remarks
 * This hook abstracts the raw mutation API exposed by
 * `useBagMutations`, allowing UI components to interact
 * with bag operations using intent-based actions.
 */
const useBagActions = () => {
	const { createBag, updateBag, deleteBag, isAnyLoading, states } =
		useBagMutations();

	/**
	 * Create a new bag.
	 *
	 * @param body - Bag creation payload.
	 * @param callbacks - Optional lifecycle callbacks.
	 */
	const create = useCallback(
		async (body: CreateBagInput, callbacks?: CallbackOptions) => {
			try {
				const { message } = await createBag(body).unwrap();
				callbacks?.onSuccess?.(message);
			} catch (err: unknown) {
				callbacks?.onError?.(err as HttpClientError);
			}
		},
		[createBag]
	);

	/**
	 * Update an existing bag.
	 *
	 * @param id - Identifier of the bag to update.
	 * @param body - Fields to update.
	 * @param callbacks - Optional lifecycle callbacks.
	 */
	const edit = useCallback(
		async (
			id: string,
			body: UpdateBagInput,
			callbacks?: CallbackOptions
		) => {
			try {
				const { message } = await updateBag(id, body).unwrap();
				callbacks?.onSuccess?.(message);
			} catch (err: unknown) {
				callbacks?.onError?.(err as HttpClientError);
			}
		},
		[updateBag]
	);

	/**
	 * Delete a bag by id.
	 *
	 * @param id - Identifier of the bag to remove.
	 * @param callbacks - Optional lifecycle callbacks.
	 */
	const remove = useCallback(
		async (id: string, callbacks?: CallbackOptions) => {
			try {
				await deleteBag(id).unwrap();
				callbacks?.onSuccess?.(SuccessMessages.BAG_DELETED);
			} catch (err: unknown) {
				callbacks?.onError?.(err as HttpClientError);
			}
		},
		[deleteBag]
	);

	return {
		create,
		edit,
		remove,

		isCreating: states.create.isLoading,
		isUpdating: states.update.isLoading,
		isDeleting: states.delete.isLoading,

		isAnyLoading,

		/** Raw mutation states for components requiring granular control. */
		states,
	};
};

export default useBagActions;
