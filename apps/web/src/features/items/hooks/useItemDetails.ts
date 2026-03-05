import { useGetItemByIdQuery } from '@features/items/api';
import type { ItemDTO } from '@beggy/shared/types';

/**
 * Result returned by {@link useItemDetails}.
 */
export type UseItemDetailsResult = {
	/** Item returned from the backend (undefined while loading or when not found). */
	item: ItemDTO | undefined;

	/** Indicates the initial loading state. */
	isLoading: boolean;

	/** Indicates background refetching. */
	isFetching: boolean;

	/**
	 * True when the request completed successfully but no item was returned.
	 *
	 * @remarks
	 * Helps distinguish between:
	 * - loading state
	 * - server error
	 * - item genuinely not existing (404 scenario)
	 */
	notFound: boolean;

	/** Transport or server error returned by the query. */
	error: unknown;

	/** Manually re-trigger the request. */
	refetch: () => void;
};

/**
 * Fetch a single item by id.
 *
 * @description
 * Feature-level hook wrapping `useGetItemByIdQuery` to expose
 * a UI-friendly result model for item detail views.
 *
 * @param id - Identifier of the item to fetch.
 *
 * @remarks
 * The query is skipped when `id` is undefined to prevent
 * unnecessary network requests during route initialization.
 */
const useItemDetails = (id?: string): UseItemDetailsResult => {
	const { data, isFetching, isLoading, error, refetch } = useGetItemByIdQuery(
		id ?? '',
		{ skip: !id }
	);

	return {
		item: data?.data,
		isFetching,
		isLoading,

		/**
		 * Query finished, no error occurred, but the API returned no item.
		 */
		notFound: !isLoading && !isFetching && !error && !data?.data,

		error,
		refetch,
	};
};

export default useItemDetails;
