import {
	useCreateBagMutation,
	useUpdateBagMutation,
	useDeleteBagByIdMutation,
} from '@features/bags/api';
import type { CreateBagInput, UpdateBagInput } from '@beggy/shared/types';

/**
 * Provides grouped mutation operations for the Bags domain.
 *
 * @description
 * Wraps RTK Query mutation hooks and exposes domain-oriented
 * mutation functions along with their associated loading states.
 *
 * @remarks
 * This hook acts as a thin adapter between the API layer and
 * higher-level orchestration hooks such as `useBagActions`.
 */
const useBagMutations = () => {
	const [createBag, createBagState] = useCreateBagMutation();
	const [updateBag, updateBagState] = useUpdateBagMutation();
	const [deleteBag, deleteBagState] = useDeleteBagByIdMutation();

	return {
		/**
		 * Create a new bag and its backing container.
		 *
		 * @param body - Bag creation payload.
		 */
		createBag: (body: CreateBagInput) => createBag(body),

		/**
		 * Partially update a bag and/or its container constraints.
		 *
		 * @param id - Identifier of the bag to update.
		 * @param body - Fields to update.
		 */
		updateBag: (id: string, body: UpdateBagInput) =>
			updateBag({ id, body }),

		/**
		 * Delete a bag and its backing container.
		 *
		 * @param id - Identifier of the bag to remove.
		 */
		deleteBag: (id: string) => deleteBag(id),

		/**
		 * Raw RTK Query mutation states grouped by operation.
		 *
		 * @remarks
		 * Exposed for components requiring granular mutation state
		 * such as success flags, error objects, or timestamps.
		 */
		states: {
			create: createBagState,
			update: updateBagState,
			delete: deleteBagState,
		},

		/**
		 * True when any bag mutation is currently in-flight.
		 *
		 * @remarks
		 * Useful for disabling UI controls during concurrent mutations.
		 */
		isAnyLoading:
			createBagState.isLoading ||
			updateBagState.isLoading ||
			deleteBagState.isLoading,
	};
};

export default useBagMutations;
