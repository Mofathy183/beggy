import { fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { BaseQueryFn, FetchArgs } from '@reduxjs/toolkit/query/react';
import type { HttpClientError } from '@shared/types';
import { normalizeError, serializeParams } from '@shared/utils';
import { env } from '@/env';

/**
 * Low-level fetch base query.
 *
 * Wraps the native `fetch` API via RTK Query's `fetchBaseQuery`
 * and defines transport-level configuration shared by all requests.
 *
 * This is a thin wrapper around `fetch` provided by RTK Query.
 * It handles:
 * - base URL resolution
 * - cookie forwarding
 * - request headers
 * - JSON parsing
 *
 * This layer must remain **framework-agnostic** and free of
 * application-specific concerns such as authentication flows
 * or error transformation.
 *
 * IMPORTANT:
 * - Env variables MUST NOT be read at module scope
 * - This factory ensures runtime-safe access
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

		const csrfToken = document.cookie
			.split('; ')
			.find((c) => c.startsWith('XSRF-TOKEN='))
			?.split('=')[1]
			?.trim();

		if (csrfToken) {
			headers.set('x-xsrf-token', csrfToken);
		}

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
	HttpClientError
> = async (args, api, extraOptions) => {
	const serializedArgs = serializeParams(args);
	const result = await rawBaseQuery(serializedArgs, api, extraOptions);

	/**
	 * If an error occurred, forward it as-is.
	 *
	 * RTK Query relies on this structure to:
	 * - set `isError`
	 * - expose `error.status`
	 * - manage retries and caching
	 */
	if (result.error) {
		const normalized = normalizeError(result.error);

		return { error: normalized };
	}

	/**
	 * Successful response.
	 *
	 * `result.data` will contain the parsed JSON payload
	 * returned by the backend.
	 */
	return result;
};
