import { useGetUserByIdQuery } from '@features/users/api';
import type { AdminUserDTO } from '@beggy/shared/types';

/**
 * Result contract for `useUserDetails`.
 */
export type UseUserDetailsResult = {
	/** Retrieved user entity. */
	user: AdminUserDTO | undefined;

	/** Indicates initial loading state. */
	isLoading: boolean;

	/** Indicates background refetching state. */
	isFetching: boolean;
	isError: boolean;

	/** Error returned from the query, if any. */
	error: unknown;

	/** Manually triggers a refetch. */
	refetch: () => Promise<unknown>;
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
	const { data, isLoading, isFetching, isError, error, refetch } =
		useGetUserByIdQuery(id ?? '', {
			skip: !id,
		});

	const user: AdminUserDTO | undefined = data?.data;

	return {
		user,
		isLoading,
		isFetching,
		isError, // ✅ added — matches BagDetailsPage usage
		error,
		refetch,
	} as const;
};

export default useUserDetails;
