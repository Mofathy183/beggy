import { useMemo, useState } from 'react';
import { PaginationMeta, PaginationParams } from '@beggy/shared/types';
import { buildListParams } from '@shared/utils';

/**
 * Configuration options for `useListQuery`.
 *
 * This hook is intentionally UI-agnostic and backend-agnostic.
 * It only coordinates state → query params → data.
 */
type UseListQueryOptions<Data, Filter, OrderBy> = {
	/**
	 * Query hook (e.g. RTK Query, React Query, Apollo wrapper).
	 * Must accept a flat params object and return list data + meta.
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

	/** Initial filter state (usually derived from route or defaults) */
	initialFilters?: Filter;

	/** Initial ordering/sorting configuration */
	initialOrderBy?: OrderBy;

	/** Initial pagination (page/limit) */
	initialPagination?: PaginationParams;
};

/**
 * Public API returned by `useListQuery`.
 *
 * Designed to map cleanly to list UIs (tables, grids, admin panels).
 */
type UseListQueryResult<Data, Filter, OrderBy> = {
	/** Normalized list data (never undefined) */
	data: Data[];

	/** Pagination metadata from backend */
	meta: PaginationMeta | null;

	/** Initial load state */
	isLoading: boolean;

	/** Background refetch state (filters/pagination change) */
	isFetching: boolean;

	/** Transport or server error */
	error?: unknown;

	// ----- state -----

	/** Current pagination state */
	pagination: PaginationParams;

	/** Current applied filters */
	filters: Filter;

	/** Current ordering configuration */
	orderBy: OrderBy;

	/** True when list contains at least one item */
	hasData: boolean;

	/** True when list is empty and not loading (UX helper) */
	isEmpty: boolean;

	// ----- actions -----

	/**
	 * Update pagination partially.
	 * Changing limit automatically resets page to 1 (UX rule).
	 */
	setPagination(next: Partial<PaginationParams>): void;

	/** Replace current filters and reset pagination */
	setFilters(filters: Filter): void;

	/** Replace current orderBy and reset pagination */
	setOrderBy(orderBy: OrderBy): void;

	/** Reset list state back to initial values */
	reset(): void;

	/** Manually re-trigger the query */
	refetch(): void;
};

/**
 * Default pagination used when no initial pagination is provided.
 * Centralized to keep behavior consistent across lists.
 */
const defaultPagination: PaginationParams = {
	limit: 10,
	page: 1,
};

/**
 * Generic list controller hook.
 *
 * Responsibilities:
 * - Own list UI state (pagination, filters, ordering)
 * - Build stable query params
 * - Execute the provided query hook
 * - Expose UX-friendly derived flags
 *
 * Non-responsibilities:
 * - Data normalization
 * - API concerns
 * - UI rendering
 */
const useListQuery = <Data, Filter, OrderBy>(
	options: UseListQueryOptions<Data, Filter, OrderBy>
): UseListQueryResult<Data, Filter, OrderBy> => {
	const { useQuery, initialFilters, initialOrderBy, initialPagination } =
		options;

	/**
	 * Resolve pagination defaults once.
	 * Prevents undefined state and keeps resets predictable.
	 */
	const resolvedInitialPagination = initialPagination ?? defaultPagination;

	/**
	 * Pagination state.
	 * Always defined to simplify UI consumption.
	 */
	const [pagination, setPagination] = useState(resolvedInitialPagination);

	/**
	 * Filter state.
	 * Defaults to an empty object to keep params serialization stable.
	 */
	const [filters, setFilters] = useState<Filter>(
		initialFilters ?? ({} as Filter)
	);

	/**
	 * Ordering state.
	 * Undefined internally, normalized to `null` when exposed.
	 */
	const [orderBy, setOrderBy] = useState<OrderBy>(
		initialOrderBy ?? ({} as OrderBy)
	);

	/**
	 * Update pagination with UX-aware rules.
	 *
	 * - Page can change freely
	 * - Changing limit resets page to 1 to avoid empty states
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
	 * Expected behavior in all list UIs.
	 */
	const updateFilters = (next: Filter) => {
		setPagination(defaultPagination);
		setFilters(next);
	};

	/**
	 * Replace ordering and reset pagination.
	 * Prevents invalid page numbers after re-sorting.
	 */
	const updateOrderBy = (next: OrderBy) => {
		setPagination(defaultPagination);
		setOrderBy(next);
	};

	/**
	 * Memoized query params.
	 * Ensures stable references and prevents unnecessary refetches.
	 */
	const params = useMemo(() => {
		return buildListParams({
			filters,
			orderBy,
			pagination,
		});
	}, [pagination, filters, orderBy]);

	/**
	 * Execute the provided query hook.
	 * The hook itself controls caching and networking.
	 */
	const query = useQuery(params);

	/**
	 * UX helpers derived from query state.
	 * Keeps UI components declarative and simple.
	 */
	const hasData = (query.data?.data?.length ?? 0) > 0;

	return {
		data: query.data?.data ?? [],
		meta: query.data?.meta ?? null,

		isLoading: query.isLoading,
		isFetching: query.isFetching,
		error: query.error,

		pagination,
		filters,
		orderBy: orderBy,

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
