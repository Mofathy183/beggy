import { fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { BaseQueryFn, FetchArgs } from '@reduxjs/toolkit/query/react';
import type { HttpClientError } from '@shared/types';
import { normalizeError, serializeParams } from '@shared/utils';
import { env } from '@/env';
import { Mutex } from 'async-mutex';

// ─── Mutex ───────────────────────────────────────────────────────────────────
// Prevents multiple concurrent 401s from each triggering a separate refresh.
// Only the first request acquires the lock and refreshes; the rest wait and
// then retry with the new cookie already set.
const refreshMutex = new Mutex();

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
	// Wait if another request is already refreshing
	await refreshMutex.waitForUnlock();

	const serializedArgs = serializeParams(args);
	let result = await rawBaseQuery(serializedArgs, api, extraOptions);

	// Not a 401 — return immediately (success or other error)
	if (!result.error || result.error.status !== 401) {
		if (result.error) {
			return { error: normalizeError(result.error) };
		}
		return result;
	}

	// ── 401 received — attempt token refresh ─────────────────────────────────

	if (refreshMutex.isLocked()) {
		// Another request is already refreshing — wait for it, then retry
		await refreshMutex.waitForUnlock();
		result = await rawBaseQuery(serializedArgs, api, extraOptions);

		if (result.error) {
			return { error: normalizeError(result.error) };
		}
		return result;
	}

	// Acquire lock — we are the one refreshing
	const release = await refreshMutex.acquire();

	try {
		const refreshResult = await rawBaseQuery(
			{
				url: '/auth/refresh-token',
				method: 'POST',
			},
			api,
			extraOptions
		);

		if (refreshResult.error) {
			// Refresh failed (refresh token expired or missing)
			// Dispatch unauthenticated so UI redirects to login
			const { setUnauthenticated } =
				await import('@features/auth/store/auth.slice');
			api.dispatch(setUnauthenticated());
			return { error: normalizeError(refreshResult.error) };
		}

		// Refresh succeeded — retry the original request
		// The new access token cookie is now set by the server
		result = await rawBaseQuery(serializedArgs, api, extraOptions);

		if (result.error) {
			return { error: normalizeError(result.error) };
		}
		return result;
	} finally {
		// Always release the lock
		release();
	}
};
