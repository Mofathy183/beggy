import { useListQuery } from '@shared/hooks';
import { useGetUsersQuery } from '@features/users/api';
import type {
	AdminUserDTO,
	UserFilterInput,
	UserOrderByInput,
} from '@beggy/shared/types';

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
	return useListQuery<AdminUserDTO, UserFilterInput, UserOrderByInput>({
		useQuery: useGetUsersQuery,
	});
};

export default useUsersList;
