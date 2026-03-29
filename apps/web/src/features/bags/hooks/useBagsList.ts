import useListQuery from '@shared/hooks/useListQuery';
import { useGetBagsQuery } from '@features/bags/api';
import { BagOrderByField, OrderDirection } from '@beggy/shared/constants';
import type {
	BagDTO,
	BagFilterInput,
	BagOrderByInput,
} from '@beggy/shared/types';

/**
 * Default sorting applied to the bags list.
 *
 * @remarks
 * bags are sorted by creation date descending so that
 * newly created bags appear first in the UI.
 */
const DEFAULT_ORDER: BagOrderByInput = {
	orderBy: BagOrderByField.CREATED_AT,
	direction: OrderDirection.DESC,
};

/**
 * useBagsList
 *
 * Manages paginated + filtered bag list state.
 *
 * @description
 * Composes the shared `useListQuery` controller with the bags
 * RTK Query endpoint, following the same pattern as items and users.
 *
 * @example
 * const {
 *   data, isLoading, isFetching,
 *   filters, setFilters, reset,
 *   pagination, setPagination, meta,
 *   orderBy, setOrderBy,
 * } = useBagsList();
 */
const useBagsList = () => {
	return useListQuery<BagDTO, BagFilterInput, BagOrderByInput>({
		useQuery: useGetBagsQuery,
		initialOrderBy: DEFAULT_ORDER,
	});
};

export default useBagsList;
