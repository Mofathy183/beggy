'use client';

import { useGetPrivateProfileQuery } from '@features/profiles/api';
import type { ProfileDTO } from '@beggy/shared/types';
import type { HttpClientError } from '@shared/types';

// ─── Result type ──────────────────────────────────────────────────────────────

export interface UsePrivateProfileResult {
	/** Full private ProfileDTO — null while loading or on error */
	profile: ProfileDTO | null;
	/**
	 * True on the very first fetch when there is no cached data yet.
	 * Use this to show skeleton loaders.
	 */
	isLoading: boolean;
	/**
	 * True whenever a request is in-flight, including background re-fetches.
	 * Use this for subtle refresh indicators (e.g. spinner in header).
	 */
	isFetching: boolean;
	isError: boolean;
	/**
	 * Fully normalized HttpClientError — already processed by baseQuery.
	 * Access error.body.message, error.body.suggestion, error.statusCode
	 * directly — no further normalization needed.
	 */
	error: HttpClientError | null;
	/** Re-trigger the query — wire to "Try again" buttons */
	refetch: () => void;
}

// ─── Hook ────────────────────────────────────────────────────────────────────

/**
 * usePrivateProfile
 *
 * Wraps `useGetPrivateProfileQuery` and unwraps the SuccessResponse envelope,
 * returning a flat, component-ready shape.
 *
 * @remarks
 * - Call only inside authenticated routes (guarded by AuthGate).
 * - RTK Query handles caching — multiple components calling this hook
 *   share one in-flight request and one cached result.
 * - `error` is already a normalized `HttpClientError` from `baseQuery`.
 *   No re-normalization needed in components.
 *
 * @example
 * const { profile, isLoading, isError, error, refetch } = usePrivateProfile();
 *
 * if (isLoading) return <ProfileCardSkeleton />;
 * if (isError || !profile) return (
 *   <ErrorState
 *     message={error?.body.message}
 *     suggestion={error?.body.suggestion}
 *     onRetry={refetch}
 *   />
 * );
 * return <ProfileCard profile={profile} />;
 */
const usePrivateProfile = (): UsePrivateProfileResult => {
	const { data, isLoading, isFetching, isError, error, refetch } =
		useGetPrivateProfileQuery();

	return {
		profile: data?.data ?? null,
		isLoading,
		isFetching,
		isError,
		// baseQuery already normalizes FetchBaseQueryError → HttpClientError.
		// RTK Query types the error as the third generic of BaseQueryFn,
		// which we set to HttpClientError in baseQuery — safe to cast.
		error: (error as HttpClientError | undefined) ?? null,
		refetch,
	};
};

export default usePrivateProfile;
