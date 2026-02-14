import { useGetUserByIdQuery } from '../users.api';
import type { UserDTO } from '@beggy/shared/types';

type UseUserDetailsResult = {
	user: UserDTO | undefined;
	isLoading: boolean;
	isFetching: boolean;
	error: unknown;

	refetch: () => void;
};

const useUserDetails = (id?: string): UseUserDetailsResult => {
	const query = useGetUserByIdQuery(id ?? '', {
		skip: !id,
	});

	return {
		user: query.data?.data,

		isLoading: query.isLoading,
		isFetching: query.isFetching,
		error: query.error,

		refetch: query.refetch,
	};
};

export default useUserDetails;
