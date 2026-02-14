import { useListQuery } from '@shared/hooks';
import { useGetUsersQuery } from '../users.api';
import type {
	UserDTO,
	UserFilterInput,
	UserOrderByInput,
} from '@beggy/shared/types';

const useUsersList = () => {
	return useListQuery<UserDTO, UserFilterInput, UserOrderByInput>({
		useQuery: useGetUsersQuery,
	});
};

export default useUsersList;
