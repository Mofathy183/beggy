import { useListQuery } from '@shared/hooks';
import { useGetUsersQuery } from '@features/users/api';
import type { AdminUserDTO, UserOrderByInput } from '@beggy/shared/types';
import { UserOrderByField, OrderDirection } from '@beggy/shared/constants';
import type { UserFilterState } from '@shared/types';

const DEFAULT_ORDER: UserOrderByInput = {
	orderBy: UserOrderByField.CREATED_AT,
	direction: OrderDirection.DESC,
};

/**
 * User list query hook.
 *
 * Specializes the generic `useListQuery` hook for the Users domain
 * by binding the appropriate DTO, filter, and ordering types.
 *
 * Provides paginated, filterable, and sortable user listing
 * through a consistent list abstraction.
 */
const useUsersList = () => {
	return useListQuery<AdminUserDTO, UserFilterState, UserOrderByInput>({
		useQuery: useGetUsersQuery,
		initialOrderBy: DEFAULT_ORDER,
	});
};

export default useUsersList;
