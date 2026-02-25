import type { ErrorResponse } from '@beggy/shared/types';
import {
	ErrorCode,
	ErrorMessages,
	ErrorSuggestions,
} from '@beggy/shared/constants';
import type { HttpClientError } from '@shared/types';
import { FetchBaseQueryError } from '@reduxjs/toolkit/query/react';

// ---------------------------------------------------------------------------
// Type Guards
// ---------------------------------------------------------------------------

/**
 * Narrows an unknown thrown value to HttpClientError.
 *
 * @remarks
 * Your API client throws `{ statusCode, body }` on non-ok responses.
 * This guard checks that exact shape so ErrorState (and any hook) can
 * safely access both statusCode and the Beggy body fields.
 *
 * Note: this checks the *wrapper*, not the body — that's intentional.
 * We need statusCode to be present for the status→copy fallbacks to work.
 *
 * @example
 * catch (err) {
 *   if (isHttpClientError(err)) {
 *     err.statusCode   // 401 | 403 | 500 etc.
 *     err.body.message // "Hold up traveler..."
 *     err.body.suggestion // "Log back in..."
 *   }
 * }
 */
export function isHttpClientError(err: unknown): err is HttpClientError {
	if (typeof err !== 'object' || err === null) return false;

	const e = err as Record<string, unknown>;

	// Check the wrapper shape first
	if (typeof e.statusCode !== 'number') return false;
	if (typeof e.body !== 'object' || e.body === null) return false;

	// Then check the body is a valid ErrorResponse
	const body = e.body as Record<string, unknown>;

	return (
		body.success === false &&
		typeof body.message === 'string' &&
		typeof body.code === 'string' &&
		typeof body.suggestion === 'string'
	);
}

/**
 * Narrows an unknown value to a plain ErrorResponse (no wrapper).
 *
 * @remarks
 * Use this only when you have a raw response body without statusCode —
 * for example if you parsed res.json() but didn't wrap it yet.
 * In most cases prefer isHttpClientError which gives you statusCode too.
 */
export function isErrorResponse(err: unknown): err is ErrorResponse {
	if (typeof err !== 'object' || err === null) return false;

	const e = err as Record<string, unknown>;

	return (
		e.success === false &&
		typeof e.message === 'string' &&
		typeof e.code === 'string' &&
		typeof e.suggestion === 'string'
	);
}
// ---------------------------------------------------------------------------
// Message lookups
// ---------------------------------------------------------------------------

/**
 * Returns the Beggy-style message for a given ErrorCode.
 *
 * This is the single source of truth for error copy on the web.
 * Falls back to the UNKNOWN_ERROR message if the code is not found
 * (should not happen in practice — ErrorMessages covers all ErrorCode values).
 *
 * @example
 * messageFromCode(ErrorCode.BAG_NOT_FOUND)
 * // → "That bag's not in your collection — maybe it was archived?"
 */
export function messageFromCode(code: ErrorCode): string {
	return ErrorMessages[code] ?? ErrorMessages[ErrorCode.UNKNOWN_ERROR];
}

/**
 * Returns the Beggy-style suggestion for a given ErrorCode.
 *
 * @example
 * suggestionFromCode(ErrorCode.BAG_NOT_FOUND)
 * // → "Check if it was archived or create a fresh bag for your next adventure."
 */
export function suggestionFromCode(code: ErrorCode): string {
	return ErrorSuggestions[code] ?? ErrorSuggestions[ErrorCode.UNKNOWN_ERROR];
}

/**
 * Returns the message for the closest matching ErrorCode based on HTTP status.
 *
 * Used as a last-resort fallback in normalizeError() when the API body
 * is not a valid ErrorResponse (proxy errors, HTML responses, etc.)
 * and we only have a status code to work with.
 *
 * Maps to a representative ErrorCode per status range — not a replacement
 * for a real ErrorCode, just the best fallback available.
 */
export function fallbackCodeFromStatus(status: number): ErrorCode {
	if (status === 400) return ErrorCode.BAD_REQUEST;
	if (status === 401) return ErrorCode.UNAUTHORIZED;
	if (status === 403) return ErrorCode.FORBIDDEN;
	if (status === 404) return ErrorCode.NOT_FOUND;
	if (status === 409) return ErrorCode.CONFLICT;
	if (status === 422) return ErrorCode.UNPROCESSABLE_ENTITY;
	if (status === 429) return ErrorCode.RATE_LIMITED;
	if (status === 503) return ErrorCode.SERVICE_UNAVAILABLE;
	if (status >= 500) return ErrorCode.INTERNAL_ERROR;
	return ErrorCode.UNKNOWN_ERROR;
}

/**
 * Converts RTK Query's FetchBaseQueryError into HttpClientError.
 *
 * This is the ONLY place in the web app that knows about FetchBaseQueryError.
 * Everything above this layer (slices, hooks, components) only sees
 * HttpClientError with fully resolved message and suggestion strings
 * sourced from ErrorMessages and ErrorSuggestions in @beggy/shared.
 *
 * Three cases:
 *
 * Case 1 — HTTP error, valid Beggy ErrorResponse body
 * The API returned a structured error. Body already contains message,
 * code, suggestion. Use it as-is — these strings came from ErrorMessages
 * and ErrorSuggestions on the API side.
 *
 * Case 2 — HTTP error, unknown body (proxy error, HTML, empty)
 * We have a status code but the body isn't a valid ErrorResponse.
 * Map status → ErrorCode via fallbackCodeFromStatus(), then look up
 * message and suggestion from the shared objects. This guarantees the
 * web always renders Beggy-style copy even for non-API HTTP errors.
 *
 * Case 3 — Network / parse failure (no HTTP response)
 * FETCH_ERROR, PARSING_ERROR, TIMEOUT_ERROR — no status code.
 * Use ErrorCode.SERVICE_UNAVAILABLE for FETCH_ERROR/TIMEOUT,
 * ErrorCode.UNKNOWN_ERROR for anything else.
 * statusCode: 0 signals a network-level failure to the UI.
 */
export const normalizeError = (raw: FetchBaseQueryError): HttpClientError => {
	// ── Case 1 & 2: HTTP error — status is a number ──────────────────────────
	if (typeof raw.status === 'number') {
		// Case 1: body is already a valid Beggy ErrorResponse — use as-is
		if (isErrorResponse(raw.data)) {
			return {
				statusCode: raw.status,
				body: raw.data,
			};
		}

		// Case 2: unknown body — synthesize from shared messages using status
		const code = fallbackCodeFromStatus(raw.status);

		return {
			statusCode: raw.status,
			body: {
				success: false,
				code,
				message: messageFromCode(code),
				suggestion: suggestionFromCode(code),
				timestamp: new Date().toISOString(),
			},
		};
	}

	// ── Case 3: Network / parse failure — no HTTP status ─────────────────────
	// Map RTK string statuses to the closest ErrorCode
	const networkCodeMap: Partial<Record<string, ErrorCode>> = {
		FETCH_ERROR: ErrorCode.SERVICE_UNAVAILABLE,
		TIMEOUT_ERROR: ErrorCode.SERVICE_UNAVAILABLE,
		PARSING_ERROR: ErrorCode.UNKNOWN_ERROR,
		CUSTOM_ERROR: ErrorCode.UNKNOWN_ERROR,
	};

	const code = networkCodeMap[raw.status] ?? ErrorCode.UNKNOWN_ERROR;

	return {
		statusCode: 0,
		body: {
			success: false,
			code,
			message: messageFromCode(code),
			suggestion: suggestionFromCode(code),
			timestamp: new Date().toISOString(),
		},
	};
};
