import {
	useCreateItemMutation,
	useUpdateItemMutation,
	useDeleteItemByIdMutation,
} from '@features/items/api';

import type { CreateItemInput, UpdateItemInput } from '@beggy/shared/types';

/**
 * Provides grouped mutation operations for the Items domain.
 *
 * @description
 * Wraps RTK Query mutation hooks and exposes domain-oriented
 * mutation functions along with their associated loading states.
 *
 * @remarks
 * This hook acts as a thin adapter between the API layer and
 * higher-level orchestration hooks such as `useItemActions`.
 */
const useItemMutations = () => {
	const [createItem, createItemState] = useCreateItemMutation();
	const [updateItem, updateItemState] = useUpdateItemMutation();
	const [deleteItem, deleteItemState] = useDeleteItemByIdMutation();

	return {
		/**
		 * Create a new item.
		 *
		 * @param body - Item creation payload.
		 */
		createItem: (body: CreateItemInput) => createItem(body),

		/**
		 * Update an existing item.
		 *
		 * @param id - Identifier of the item to update.
		 * @param body - Fields to update.
		 */
		updateItem: (id: string, body: UpdateItemInput) =>
			updateItem({ id, body }),

		/**
		 * Delete an item by id.
		 *
		 * @param id - Identifier of the item to remove.
		 */
		deleteItem: (id: string) => deleteItem(id),

		/**
		 * Raw RTK Query mutation states grouped by operation.
		 *
		 * @remarks
		 * Exposed for components requiring granular mutation state
		 * such as success flags, error objects, or timestamps.
		 */
		states: {
			create: createItemState,
			update: updateItemState,
			delete: deleteItemState,
		},

		/**
		 * True when any item mutation is currently in-flight.
		 *
		 * @remarks
		 * Useful for disabling UI controls that should not be
		 * interacted with during concurrent mutations.
		 */
		isAnyLoading:
			createItemState.isLoading ||
			updateItemState.isLoading ||
			deleteItemState.isLoading,
	};
};

export default useItemMutations;
