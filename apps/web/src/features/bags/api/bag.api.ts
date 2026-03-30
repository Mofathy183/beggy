import { apiSlice, TagTypes } from '@shared/api';
import type {
	SuccessResponse,
	BagDTO,
	BagFilterInput,
	CreateBagInput,
	UpdateBagInput,
} from '@beggy/shared/types';

/**
 * RTK Query endpoints for the Bag domain.
 *
 * @remarks
 * Extends the shared `apiSlice` with CRUD operations for bags and
 * configures cache invalidation using `TagTypes.BAG`.
 *
 * These endpoints power the auto-generated React hooks used by
 * feature modules to interact with the Bags API.
 */
export const bagApi = apiSlice.injectEndpoints({
	endpoints: (builder) => ({
		/**
		 * Fetch a filtered + paginated list of bags.
		 *
		 * @route GET /bags
		 *
		 * @param params - Query filters, pagination, and ordering applied by the backend.
		 * @returns A success response containing an array of bags with computed status.
		 *
		 * @remarks
		 * Each returned bag is individually tagged for fine-grained cache updates,
		 * while the `LIST` tag represents the collection.
		 */
		getBags: builder.query<SuccessResponse<BagDTO[]>, BagFilterInput>({
			query: (params) => ({
				url: '/bags',
				params,
			}),
			providesTags: (result) =>
				result
					? [
							...result.data.map(({ id }) => ({
								type: TagTypes.BAG,
								id,
							})),
							{ type: TagTypes.BAG, id: 'LIST' },
						]
					: [{ type: TagTypes.BAG, id: 'LIST' }],
		}),

		/**
		 * Fetch a single bag by its identifier.
		 *
		 * @route GET /bags/:id
		 *
		 * @param id - Unique bag identifier.
		 *
		 * @remarks
		 * Response includes pre-computed ContainerStatusDTO with
		 * metrics and state — no additional calculation needed in the UI.
		 */
		getBagById: builder.query<SuccessResponse<BagDTO>, string>({
			query: (id) => ({
				url: `/bags/${id}`,
			}),
			providesTags: (_result, _error, id) => [{ type: TagTypes.BAG, id }],
		}),

		/**
		 * Create a new bag and its backing container.
		 *
		 * @route POST /bags
		 *
		 * @param body - Bag creation payload.
		 *
		 * @remarks
		 * Invalidates the bag list cache so the new bag appears
		 * in subsequent list queries.
		 */
		createBag: builder.mutation<SuccessResponse<BagDTO>, CreateBagInput>({
			query: (body) => ({
				url: '/bags',
				method: 'POST',
				body,
			}),
			invalidatesTags: [{ type: TagTypes.BAG, id: 'LIST' }],
		}),

		/**
		 * Partially update a bag and/or its container constraints.
		 *
		 * @route PATCH /bags/:id
		 *
		 * @param payload.id - Identifier of the bag to update.
		 * @param payload.body - Fields to update.
		 *
		 * @remarks
		 * Invalidates both the specific bag and the list cache
		 * since container metrics may change (maxWeight, maxCapacity).
		 */
		updateBag: builder.mutation<
			SuccessResponse<BagDTO>,
			{ id: string; body: UpdateBagInput }
		>({
			query: ({ id, body }) => ({
				url: `/bags/${id}`,
				method: 'PATCH',
				body,
			}),
			invalidatesTags: (_result, _error, { id }) => [
				{ type: TagTypes.BAG, id },
				{ type: TagTypes.BAG, id: 'LIST' },
			],
		}),

		/**
		 * Delete a bag and its backing container.
		 *
		 * @route DELETE /bags/:id
		 *
		 * @param id - Identifier of the bag to remove.
		 *
		 * @remarks
		 * Invalidates both the specific bag and the list cache.
		 * Cascade deletion of ContainerItems is handled server-side.
		 */
		deleteBagById: builder.mutation<void, string>({
			query: (id) => ({
				url: `/bags/${id}`,
				method: 'DELETE',
			}),
			invalidatesTags: (_result, _error, id) => [
				{ type: TagTypes.BAG, id },
				{ type: TagTypes.BAG, id: 'LIST' },
			],
		}),
	}),
	overrideExisting: false,
});

/**
 * Auto-generated React hooks for interacting with the Bag API.
 */
export const {
	useGetBagsQuery,
	useGetBagByIdQuery,
	useCreateBagMutation,
	useUpdateBagMutation,
	useDeleteBagByIdMutation,
} = bagApi;
