import { useCallback } from 'react';
import useItemMutations from './useItemMutations';

import type { CreateItemInput, UpdateItemInput } from '@beggy/shared/types';

import { SuccessMessages } from '@beggy/shared/constants';
import { HttpClientError } from '@/shared/types';

/**
 * Optional callbacks executed after a mutation attempt.
 */
type CallBackOptions = {
	/** Invoked when the mutation completes successfully. */
	onSuccess?: (messages: string) => void;

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
				const { message } = await createItem(body).unwrap();
				callbacks?.onSuccess?.(message);
			} catch (err: unknown) {
				callbacks?.onError?.(err as HttpClientError);
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
				const { message } = await updateItem(id, body).unwrap();
				callbacks?.onSuccess?.(message);
			} catch (err: unknown) {
				callbacks?.onError?.(err as HttpClientError);
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
				callbacks?.onSuccess?.(SuccessMessages.ITEM_DELETED);
			} catch (err: unknown) {
				callbacks?.onError?.(err as HttpClientError);
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
