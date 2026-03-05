import { useCallback } from 'react';
import useItemMutations from './useItemMutations';

import type { CreateItemInput, UpdateItemInput } from '@beggy/shared/types';

/**
 * Optional callbacks executed after a mutation attempt.
 */
type CallBackOptions = {
	/** Invoked when the mutation completes successfully. */
	onSuccess?: () => void;

	/** Invoked when the mutation fails. */
	onError?: (err: unknown) => void;
};

/**
 * Feature-level action hook for Item mutations.
 *
 * @description
 * Provides UI-friendly wrappers around item mutations
 * (create, update, delete) with built-in error handling
 * and optional lifecycle callbacks.
 *
 * @remarks
 * This hook abstracts the raw mutation API exposed by
 * `useItemMutations`, allowing UI components to interact
 * with item operations using intent-based actions.
 */
const useItemActions = () => {
	const { createItem, deleteItem, updateItem, isAnyLoading, states } =
		useItemMutations();

	/**
	 * Create a new item.
	 *
	 * @param body - Item creation payload.
	 * @param callbacks - Optional lifecycle callbacks.
	 */
	const create = useCallback(
		async (body: CreateItemInput, callbacks?: CallBackOptions) => {
			try {
				await createItem(body).unwrap();
				callbacks?.onSuccess?.();
			} catch (error: unknown) {
				callbacks?.onError?.(error);
			}
		},
		[createItem]
	);

	/**
	 * Update an existing item.
	 *
	 * @param id - Identifier of the item to update.
	 * @param body - Fields to update.
	 * @param callbacks - Optional lifecycle callbacks.
	 */
	const edit = useCallback(
		async (
			id: string,
			body: UpdateItemInput,
			callbacks?: CallBackOptions
		) => {
			try {
				await updateItem(id, body).unwrap();
				callbacks?.onSuccess?.();
			} catch (error: unknown) {
				callbacks?.onError?.(error);
			}
		},
		[updateItem]
	);

	/**
	 * Delete an item by id.
	 *
	 * @param id - Identifier of the item to remove.
	 * @param callbacks - Optional lifecycle callbacks.
	 */
	const remove = useCallback(
		async (id: string, callbacks?: CallBackOptions) => {
			try {
				await deleteItem(id).unwrap();
				callbacks?.onSuccess?.();
			} catch (error: unknown) {
				callbacks?.onError?.(error);
			}
		},
		[deleteItem]
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

export default useItemActions;
