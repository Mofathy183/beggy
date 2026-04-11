import { apiSlice, TagTypes } from '@shared/api';
import type {
	SuccessResponse,
	ContainerStatusDTO,
	ContainerSummaryDTO,
	MoveResultDTO,
	PackItemInput,
	UnpackItemInput,
	MoveItemInput,
} from '@beggy/shared/types';

/**
 * Container API slice.
 *
 * @description
 * Extends the shared `apiSlice` with container-related operations
 * (state retrieval, packing, unpacking, and moving items).
 *
 * @remarks
 * Cache strategy is based on container-level invalidation:
 * - Queries provide a `{ type: CONTAINER, id }` tag
 * - Mutations invalidate affected container IDs to trigger refetch
 */
export const containerApi = apiSlice.injectEndpoints({
	endpoints: (builder) => ({
		/**
		 * Fetch full container state including metrics and packed items.
		 *
		 * @param containerId - Target container identifier
		 * @route GET /containers/:id/state
		 */
		getContainerState: builder.query<
			SuccessResponse<ContainerStatusDTO>,
			string
		>({
			query: (containerId) => ({
				url: `/containers/${containerId}/state`,
			}),
			providesTags: (_result, _error, containerId) => [
				{ type: TagTypes.CONTAINER, id: containerId },
			],
		}),

		/**
		 * Pack an item into a container.
		 *
		 * @param containerId - Target container identifier
		 * @param body - Packing payload
		 * @route POST /containers/:id/pack
		 * @returns Updated container summary
		 */
		packItem: builder.mutation<
			SuccessResponse<ContainerSummaryDTO>,
			{ containerId: string; body: PackItemInput }
		>({
			query: ({ containerId, body }) => ({
				url: `/containers/${containerId}/pack`,
				method: 'POST',
				body,
			}),
			invalidatesTags: (_result, _error, { containerId }) => [
				{ type: TagTypes.CONTAINER, id: containerId },
			],
		}),

		/**
		 * Unpack an item from a container.
		 *
		 * @param containerId - Target container identifier
		 * @param body - Unpacking payload
		 * @route POST /containers/:id/unpack
		 * @returns Updated container summary
		 */
		unpackItem: builder.mutation<
			SuccessResponse<ContainerSummaryDTO>,
			{ containerId: string; body: UnpackItemInput }
		>({
			query: ({ containerId, body }) => ({
				url: `/containers/${containerId}/unpack`,
				method: 'POST',
				body,
			}),
			invalidatesTags: (_result, _error, { containerId }) => [
				{ type: TagTypes.CONTAINER, id: containerId },
			],
		}),

		/**
		 * Move an item between containers.
		 *
		 * @param body - Move payload including source and destination IDs
		 * @route POST /containers/move
		 * @returns Updated summaries for both containers
		 *
		 * @remarks
		 * Invalidates both source and destination containers to keep UI in sync.
		 */
		moveItem: builder.mutation<
			SuccessResponse<MoveResultDTO>,
			MoveItemInput
		>({
			query: (body) => ({
				url: `/containers/move`,
				method: 'POST',
				body,
			}),
			invalidatesTags: (
				_result,
				_error,
				{ fromContainerId, toContainerId }
			) => {
				// Defensive guard to avoid invalid cache keys
				const tags = [];

				if (fromContainerId) {
					tags.push({
						type: TagTypes.CONTAINER,
						id: fromContainerId,
					});
				}

				if (toContainerId) {
					tags.push({
						type: TagTypes.CONTAINER,
						id: toContainerId,
					});
				}

				return tags;
			},
		}),
	}),
	overrideExisting: false,
});

export const {
	useGetContainerStateQuery,
	usePackItemMutation,
	useUnpackItemMutation,
	useMoveItemMutation,
} = containerApi;
