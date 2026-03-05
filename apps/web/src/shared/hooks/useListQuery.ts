import { useMemo, useState } from 'react';
import { PaginationMeta, PaginationParams } from '@beggy/shared/types';
import { buildListParams } from '@shared/utils';

/**
 * Configuration options for {@link useListQuery}.
 *
 * @typeParam Data - Item type returned by the backend.
 * @typeParam Filter - Filter shape used by the list.
 * @typeParam OrderBy - Sorting configuration shape.
 */
type UseListQueryOptions<Data, Filter, OrderBy> = {
	/**
	 * Query hook responsible for executing the request.
	 *
	 * @remarks
	 * The hook must accept a flat params object and return list data
	 * along with query lifecycle flags.
	 */
	useQuery: (params: Record<string, unknown>) => {
		data?: {
			data: Data[];
			meta?: PaginationMeta;
		};
		isLoading: boolean;
		isFetching: boolean;
		error?: unknown;
		refetch: () => void;
	};

	/** Initial filter state. */
	initialFilters?: Filter;

	/** Initial sorting configuration. */
	initialOrderBy?: OrderBy;

	/** Initial pagination state. */
	initialPagination?: PaginationParams;
};

/**
 * Result returned by {@link useListQuery}.
 *
 * Designed to map directly to list-based UIs such as tables or grids.
 */
type UseListQueryResult<Data, Filter, OrderBy> = {
	/** Normalized list data (never undefined). */
	data: Data[];

	/** Pagination metadata returned by the backend. */
	meta: PaginationMeta | null;

	/** Indicates the first load state. */
	isLoading: boolean;

	/** Indicates a background refetch. */
	isFetching: boolean;

	/** Transport or server error. */
	error?: unknown;

	// ----- state -----

	/** Current pagination state. */
	pagination: PaginationParams;

	/** Active filters applied to the list. */
	filters: Filter;

	/** Active sorting configuration. */
	orderBy: OrderBy;

	/** True when at least one item is present. */
	hasData: boolean;

	/** True when the list is empty and not loading. */
	isEmpty: boolean;

	// ----- actions -----

	/**
	 * Update pagination partially.
	 *
	 * @remarks
	 * Changing `limit` automatically resets `page` to `1`
	 * to prevent invalid pagination states.
	 */
	setPagination(next: Partial<PaginationParams>): void;

	/** Replace filters and reset pagination. */
	setFilters(filters: Filter): void;

	/** Replace sorting configuration and reset pagination. */
	setOrderBy(orderBy: OrderBy): void;

	/** Restore initial list state. */
	reset(): void;

	/** Manually re-trigger the underlying query. */
	refetch(): void;
};

/**
 * Default pagination used when none is provided.
 *
 * Centralizing defaults ensures consistent behavior across lists.
 */
const defaultPagination: PaginationParams = {
	limit: 10,
	page: 1,
};

/**
 * Generic list controller hook.
 *
 * @description
 * Manages list UI state (pagination, filters, sorting) and connects it
 * to a query hook responsible for data fetching.
 *
 * @remarks
 * This hook is intentionally agnostic to the underlying data client.
 * It can work with RTK Query, React Query, Apollo, or any custom hook
 * implementing the expected interface.
 *
 * @typeParam Data - Item type returned by the backend.
 * @typeParam Filter - Filter type used for the list.
 * @typeParam OrderBy - Sorting configuration type.
 */
const useListQuery = <Data, Filter, OrderBy>(
	options: UseListQueryOptions<Data, Filter, OrderBy>
): UseListQueryResult<Data, Filter, OrderBy> => {
	const { useQuery, initialFilters, initialOrderBy, initialPagination } =
		options;

	const resolvedInitialPagination = initialPagination ?? defaultPagination;

	const [pagination, setPagination] = useState(resolvedInitialPagination);

	const [filters, setFilters] = useState<Filter>(
		initialFilters ?? ({} as Filter)
	);

	const [orderBy, setOrderBy] = useState<OrderBy>(
		initialOrderBy ?? ({} as OrderBy)
	);

	/**
	 * Update pagination with UX-aware rules.
	 *
	 * Changing the page size resets the current page to avoid empty views.
	 */
	const updatePagination = (next: Partial<PaginationParams>) => {
		setPagination((prev) => ({
			...prev,
			...next,
			page: next.limit ? 1 : prev.page,
		}));
	};

	/**
	 * Replace filters and reset pagination.
	 */
	const updateFilters = (next: Filter) => {
		setPagination(defaultPagination);
		setFilters(next);
	};

	/**
	 * Replace sorting configuration and reset pagination.
	 */
	const updateOrderBy = (next: OrderBy) => {
		setPagination(defaultPagination);
		setOrderBy(next);
	};

	/**
	 * Build stable query parameters used by the query hook.
	 */
	const params = useMemo(() => {
		return buildListParams({
			filters,
			orderBy,
			pagination,
		});
	}, [pagination, filters, orderBy]);

	const query = useQuery(params);

	const hasData = (query.data?.data?.length ?? 0) > 0;

	return {
		data: query.data?.data ?? [],
		meta: query.data?.meta ?? null,

		isLoading: query.isLoading,
		isFetching: query.isFetching,
		error: query.error,

		pagination,
		filters,
		orderBy,

		hasData,
		isEmpty: !query.isLoading && !hasData,

		setPagination: updatePagination,
		setFilters: updateFilters,
		setOrderBy: updateOrderBy,

		/**
		 * Restore initial list state.
		 * Useful for "Reset filters" or route changes.
		 */
		reset: () => {
			setPagination(resolvedInitialPagination);
			setFilters(initialFilters ?? ({} as Filter));
			setOrderBy(initialOrderBy ?? ({} as OrderBy));
		},

		refetch: query.refetch,
	};
};

export default useListQuery;
