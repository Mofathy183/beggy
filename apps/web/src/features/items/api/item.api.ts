import { apiSlice, TagTypes } from '@shared/api';
import type {
	SuccessResponse,
	ItemDTO,
	ItemFilterInput,
	CreateItemInput,
	UpdateItemInput,
} from '@beggy/shared/types';

/**
 * RTK Query endpoints for the Item domain.
 *
 * @remarks
 * Extends the shared `apiSlice` with CRUD operations for items and
 * configures cache invalidation using `TagTypes.ITEM`.
 *
 * These endpoints power the auto-generated React hooks used by
 * feature modules to interact with the Items API.
 */
export const itemApi = apiSlice.injectEndpoints({
	endpoints: (builder) => ({
		/**
		 * Fetch a filtered list of items.
		 *
		 * @route GET /items
		 *
		 * @param params - Query filters applied by the backend.
		 * @returns A success response containing an array of items.
		 *
		 * @remarks
		 * Each returned item is individually tagged for fine-grained cache updates,
		 * while the `LIST` tag represents the collection.
		 */
		getItems: builder.query<SuccessResponse<ItemDTO[]>, ItemFilterInput>({
			query: (params) => ({
				url: '/items',
				params,
			}),
			providesTags: (result) =>
				result
					? [
							...result.data.map(({ id }) => ({
								type: TagTypes.ITEM,
								id,
							})),
							{ type: TagTypes.ITEM, id: 'LIST' },
						]
					: [{ type: TagTypes.ITEM, id: 'LIST' }],
		}),

		/**
		 * Fetch a single item by its identifier.
		 *
		 * @route GET /items/:id
		 *
		 * @param id - Unique item identifier.
		 */
		getItemById: builder.query<SuccessResponse<ItemDTO>, string>({
			query: (id) => ({
				url: `/items/${id}`,
			}),
			providesTags: (_result, _error, id) => [
				{ type: TagTypes.ITEM, id },
			],
		}),

		/**
		 * Create a new item.
		 *
		 * @route POST /items
		 *
		 * @param body - Item creation payload.
		 *
		 * @remarks
		 * Invalidates the item list cache so the new item appears
		 * in subsequent list queries.
		 */
		createItem: builder.mutation<SuccessResponse<ItemDTO>, CreateItemInput>(
			{
				query: (body) => ({
					url: '/items',
					method: 'POST',
					body,
				}),
				invalidatesTags: [{ type: TagTypes.ITEM, id: 'LIST' }],
			}
		),

		/**
		 * Update an existing item.
		 *
		 * @route PATCH /items
		 *
		 * @param payload.id - Identifier of the item to update.
		 * @param payload.body - Fields to update.
		 */
		updateItem: builder.mutation<
			SuccessResponse<ItemDTO>,
			{ id: string; body: UpdateItemInput }
		>({
			query: ({ id, body }) => ({
				url: `/items/${id}`,
				method: 'PATCH',
				body,
			}),
			invalidatesTags: (_result, _error, { id }) => [
				{ type: TagTypes.ITEM, id },
			],
		}),

		/**
		 * Delete an item by id.
		 *
		 * @route DELETE /items
		 *
		 * @param id - Identifier of the item to remove.
		 *
		 * @remarks
		 * Invalidates both the specific item and the item list cache.
		 */
		deleteItemById: builder.mutation<void, string>({
			query: (id) => ({
				url: `/items/${id}`,
				method: 'DELETE',
			}),
			invalidatesTags: (_result, _error, id) => [
				{ type: TagTypes.ITEM, id },
				{ type: TagTypes.ITEM, id: 'LIST' },
			],
		}),
	}),
	overrideExisting: false,
});

/**
 * Auto-generated React hooks for interacting with the Item API.
 */
export const {
	useGetItemsQuery,
	useGetItemByIdQuery,
	useCreateItemMutation,
	useUpdateItemMutation,
	useDeleteItemByIdMutation,
} = itemApi;
