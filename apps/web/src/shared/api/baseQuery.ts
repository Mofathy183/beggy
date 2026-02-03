import { fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type {
	BaseQueryFn,
	FetchArgs,
	FetchBaseQueryError,
} from '@reduxjs/toolkit/query/react';
import { env } from '@/env';
import { isApiError, isValidationError } from '@shared/utils';

/**
 * Low-level fetch base query.
 *
 * This is a thin wrapper around `fetch` provided by RTK Query.
 * It handles:
 * - base URL resolution
 * - cookie forwarding
 * - request headers
 * - JSON parsing
 *
 * This layer should remain framework-agnostic and free of
 * application-specific logic.
 */
const rawBaseQuery = fetchBaseQuery({
	/**
	 * Base URL for all API requests.
	 *
	 * Must be exposed with `NEXT_PUBLIC_` because this code
	 * runs in the browser.
	 */
	baseUrl: env.API_URL,

	/**
	 * Ensures cookies (e.g. session, refresh tokens)
	 * are sent with every request.
	 */
	credentials: 'include',

	/**
	 * Prepare default headers for every request.
	 *
	 * Note:
	 * - Do NOT set `Content-Type` globally
	 *   (fetchBaseQuery handles it automatically for JSON)
	 * - Auth headers (if any) can be added later here
	 */
	prepareHeaders: (headers) => {
		headers.set('Accept', 'application/json');
		return headers;
	},
});

/**
 * Application-level base query.
 *
 * This wraps `rawBaseQuery` to provide a single interception point
 * for all API requests and responses.
 *
 * Responsibilities (now):
 * - Delegate requests to `rawBaseQuery`
 * - Forward errors in RTK Query's expected format
 *
 * Responsibilities (future):
 * - Global error normalization
 * - Auth refresh / logout handling
 * - Logging and monitoring hooks
 *
 * Important:
 * - This function must always return `{ data }` or `{ error }`
 * - Do NOT throw errors from here
 * - Do NOT reshape the RTK Query error contract
 */
export const baseQuery: BaseQueryFn<
	string | FetchArgs,
	unknown,
	FetchBaseQueryError
> = async (args, api, extraOptions) => {
	const result = await rawBaseQuery(args, api, extraOptions);

	/**
	 * If an error occurred, forward it as-is.
	 *
	 * RTK Query relies on this structure to:
	 * - set `isError`
	 * - expose `error.status`
	 * - manage retries and caching
	 */
	if (result.error) {
		/**
		 * Stage 1: Observe only
		 */
		if (isApiError(result.error)) {
			// Validation errors → handled by forms
			if (isValidationError(result.error)) {
				// intentionally empty
			}

			// Unauthorized → future auth handling
			if (result.error.status === 401) {
				// later: logout / refresh
			}
		}

		return { error: result.error };
	}

	/**
	 * Successful response.
	 *
	 * `result.data` will contain the parsed JSON payload
	 * returned by the backend.
	 */
	return result;
};
