import { useGetUserByIdQuery } from '../users.api';
import type { UserDTO } from '@beggy/shared/types';

/**
 * Result contract for `useUserDetails`.
 */
export type UseUserDetailsResult = {
	/** Retrieved user entity. */
	user: UserDTO | undefined;

	/** Indicates initial loading state. */
	isLoading: boolean;

	/** Indicates background refetching state. */
	isFetching: boolean;

	/** Error returned from the query, if any. */
	error: unknown;

	/** Manually triggers a refetch. */
	refetch: () => void;
};

/**
 * Fetches a single user by identifier.
 *
 * Acts as a thin abstraction over the underlying query hook,
 * exposing a UI-friendly result shape.
 *
 * The query is skipped when no `id` is provided.
 *
 * @param id - User identifier.
 */
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
