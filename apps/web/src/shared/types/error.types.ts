import type { ErrorResponse } from '@beggy/shared/types';

/**
 * The error shape the web API client throws on failed requests.
 *
 * @remarks
 * Wraps the shared ErrorResponse body with the HTTP statusCode.
 *
 * Separation of concerns:
 * - `body` — the Beggy API response body (message, code, suggestion).
 *   This is ErrorResponse from @beggy/shared/types, intentionally
 *   HTTP-agnostic so the shared package stays clean.
 * - `statusCode` — the HTTP transport concern. Lives here, not in shared.
 *
 * @example
 * // In your API client (e.g. users.api.ts):
 * if (!res.ok) {
 *   throw { statusCode: res.status, body: await res.json() } satisfies HttpClientError;
 * }
 *
 * // In a component or hook:
 * catch (err) {
 *   if (isHttpClientError(err)) {
 *     // err.statusCode → 401, 403, 500, etc.
 *     // err.body.message → Beggy-style message
 *     // err.body.suggestion → Beggy-style suggestion
 *   }
 * }
 */
export interface HttpClientError {
	statusCode: number;
	body: ErrorResponse;
}
