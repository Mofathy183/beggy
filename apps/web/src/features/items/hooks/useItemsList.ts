import { useListQuery } from '@shared/hooks';
import { useGetItemsQuery } from '@features/items/api';

import type {
	ItemDTO,
	ItemFilterInput,
	ItemOrderByInput,
} from '@beggy/shared/types';

import { ItemOrderByField, OrderDirection } from '@beggy/shared/constants';

/**
 * Default sorting applied to the items list.
 *
 * @remarks
 * Items are sorted by creation date descending so that
 * newly created items appear first in the UI.
 */
const DEFAULT_ORDER: ItemOrderByInput = {
	orderBy: ItemOrderByField.CREATED_AT,
	direction: OrderDirection.DESC,
};

/**
 * Feature-level list hook for Items.
 *
 * @description
 * Configures the generic {@link useListQuery} controller for the
 * Items domain by wiring it to the `useGetItemsQuery` API hook
 * and applying domain-specific defaults.
 *
 * @remarks
 * - Default sorting: newest items first
 * - Default page size: 12 items (optimized for a 3-column card grid)
 *
 * This hook keeps UI components simple by encapsulating list
 * configuration in a single reusable place.
 */
const useItemsList = () => {
	return useListQuery<ItemDTO, ItemFilterInput, ItemOrderByInput>({
		useQuery: useGetItemsQuery,
		initialOrderBy: DEFAULT_ORDER,
		initialPagination: { page: 1, limit: 12 },
	});
};

export default useItemsList;
