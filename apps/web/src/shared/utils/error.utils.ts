import type { ErrorResponse } from '@beggy/shared/types';
import type { HttpClientError } from '@shared/types';

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
// Status code → UI copy
// Fallback used when only a native JS Error is available (no statusCode)
// ---------------------------------------------------------------------------

export function titleFromStatus(status: number | null): string {
	switch (status) {
		case 400:
			return "Something doesn't look right.";
		case 401:
			return "You'll need to sign in first.";
		case 403:
			return "You don't have permission to do that.";
		case 404:
			return "We couldn't find what you're looking for.";
		case 409:
			return 'There was a conflict with your request.';
		case 422:
			return "We couldn't process that request.";
		case 429:
			return "Too many requests — let's slow down a little.";
		case 500:
			return 'Something went wrong on our end.';
		case 503:
			return "We're having some trouble right now.";
		default:
			return 'Something went wrong.';
	}
}

export function descriptionFromStatus(status: number | null): string {
	switch (status) {
		case 401:
			return "Your session may have expired. Sign in again and you'll be right back.";
		case 403:
			return "Your account doesn't have access to this. Contact your admin if this seems wrong.";
		case 429:
			return "You've hit a rate limit. Wait a moment and try again.";
		case 500:
		case 503:
			return 'Our team has been notified. Try refreshing, or come back in a few minutes.';
		default:
			return 'Try again, or head home if the problem keeps happening.';
	}
}
