import { describe, it, expect } from 'vitest';
import {
	ErrorCode,
	ErrorMessages,
	ErrorSuggestions,
} from '@beggy/shared/constants';
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query';

import {
	isHttpClientError,
	isErrorResponse,
	messageFromCode,
	suggestionFromCode,
	fallbackCodeFromStatus,
	normalizeError,
} from '../error.utils'; // adjust path

describe('isHttpClientError()', () => {
	it('returns true for a valid http client error', () => {
		const err = {
			statusCode: 401,
			body: {
				success: false,
				code: ErrorCode.UNAUTHORIZED,
				message: 'msg',
				suggestion: 'try again',
			},
		};

		expect(isHttpClientError(err)).toBe(true);
	});

	it('returns false when wrapper shape is invalid', () => {
		expect(isHttpClientError(null)).toBe(false);
		expect(isHttpClientError({})).toBe(false);
		expect(isHttpClientError({ statusCode: '401' })).toBe(false);
	});

	it('returns false when body shape is invalid', () => {
		const err = {
			statusCode: 401,
			body: { success: true },
		};

		expect(isHttpClientError(err)).toBe(false);
	});
});

describe('isErrorResponse()', () => {
	it('returns true for a valid error response', () => {
		const body = {
			success: false,
			code: ErrorCode.BAD_REQUEST,
			message: 'invalid',
			suggestion: 'fix it',
		};

		expect(isErrorResponse(body)).toBe(true);
	});

	it('returns false for invalid shapes', () => {
		expect(isErrorResponse(null)).toBe(false);
		expect(isErrorResponse({ success: true })).toBe(false);
	});
});

describe('messageFromCode()', () => {
	it('returns message for a known code', () => {
		const message = messageFromCode(ErrorCode.BAD_REQUEST);

		expect(message).toBe(ErrorMessages[ErrorCode.BAD_REQUEST]);
	});

	it('returns unknown error message when code is missing', () => {
		const message = messageFromCode('NON_EXISTENT' as ErrorCode);

		expect(message).toBe(ErrorMessages[ErrorCode.UNKNOWN_ERROR]);
	});
});

describe('suggestionFromCode()', () => {
	it('returns suggestion for a known code', () => {
		const suggestion = suggestionFromCode(ErrorCode.BAD_REQUEST);

		expect(suggestion).toBe(ErrorSuggestions[ErrorCode.BAD_REQUEST]);
	});
});

describe('fallbackCodeFromStatus()', () => {
	it('returns mapped code for known status codes', () => {
		expect(fallbackCodeFromStatus(400)).toBe(ErrorCode.BAD_REQUEST);
		expect(fallbackCodeFromStatus(401)).toBe(ErrorCode.UNAUTHORIZED);
		expect(fallbackCodeFromStatus(404)).toBe(ErrorCode.NOT_FOUND);
	});

	it('returns internal error for 5xx status codes', () => {
		expect(fallbackCodeFromStatus(500)).toBe(ErrorCode.INTERNAL_ERROR);
		expect(fallbackCodeFromStatus(502)).toBe(ErrorCode.INTERNAL_ERROR);
	});

	it('returns unknown error for unhandled status', () => {
		expect(fallbackCodeFromStatus(418)).toBe(ErrorCode.UNKNOWN_ERROR);
	});
});

describe('normalizeError()', () => {
	it('returns api error body when response contains valid error data', () => {
		const raw: FetchBaseQueryError = {
			status: 401,
			data: {
				success: false,
				code: ErrorCode.UNAUTHORIZED,
				message: 'Auth required',
				suggestion: 'Log in',
			},
		};

		const result = normalizeError(raw);

		expect(result.statusCode).toBe(401);
		expect(result.body.code).toBe(ErrorCode.UNAUTHORIZED);
		expect(result.body.message).toBe('Auth required');
	});

	it('returns synthesized error body when response data is unknown', () => {
		const raw: FetchBaseQueryError = {
			status: 404,
			data: { random: 'html response' },
		};

		const result = normalizeError(raw);

		expect(result.statusCode).toBe(404);
		expect(result.body.code).toBe(ErrorCode.NOT_FOUND);
		expect(result.body.message).toBe(ErrorMessages[ErrorCode.NOT_FOUND]);
	});

	it('returns service unavailable when status is fetch error', () => {
		const raw: FetchBaseQueryError = {
			status: 'FETCH_ERROR',
			error: 'Failed to fetch',
		};

		const result = normalizeError(raw);

		expect(result.statusCode).toBe(0);
		expect(result.body.code).toBe(ErrorCode.SERVICE_UNAVAILABLE);
	});

	it('returns unknown error when status is parsing error', () => {
		const raw: FetchBaseQueryError = {
			status: 'PARSING_ERROR',
			originalStatus: 200,
			data: '',
			error: 'Invalid JSON',
		};

		const result = normalizeError(raw);

		expect(result.body.code).toBe(ErrorCode.UNKNOWN_ERROR);
	});
});
