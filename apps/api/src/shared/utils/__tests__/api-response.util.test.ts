import { describe, it, expect } from 'vitest';

import { createResponse, apiResponseMap } from '@shared/utils';

import {
	ErrorCode,
	SuccessMessages,
	ErrorMessages,
	ErrorSuggestions,
} from '@beggy/shared/constants';

import { STATUS_CODE } from '@shared/constants';

describe('createResponse.success()', () => {
	it('returns standardized success response', () => {
		const data = { id: '1' };

		const result = createResponse.success(
			data,
			'PROFILE_UPDATED',
			STATUS_CODE.OK
		);

		expect(result.success).toBe(true);
		expect(result.status).toBe(STATUS_CODE.OK);
		expect(result.message).toBe(SuccessMessages.PROFILE_UPDATED);
		expect(result.data).toEqual(data);
		expect(result.timestamp).toBeTypeOf('string');
	});

	it('includes meta when provided', () => {
		const meta = {
			page: 1,
			limit: 10,
			count: 5,
			hasNextPage: false,
			hasPreviousPage: false,
		};

		const result = createResponse.success(
			[],
			'BAG_UPDATED',
			STATUS_CODE.OK,
			meta
		);

		expect(result.meta).toEqual(meta);
	});
});

describe('createResponse.error()', () => {
	it('returns standardized error response', () => {
		const result = createResponse.error(
			ErrorCode.VALIDATION_ERROR,
			STATUS_CODE.BAD_REQUEST
		);

		expect(result.success).toBe(false);
		expect(result.status).toBe(STATUS_CODE.BAD_REQUEST);
		expect(result.code).toBe(ErrorCode.VALIDATION_ERROR);
		expect(result.message).toBe(ErrorMessages[ErrorCode.VALIDATION_ERROR]);
		expect(result.suggestion).toBe(
			ErrorSuggestions[ErrorCode.VALIDATION_ERROR]
		);
		expect(result.timestamp).toBeTypeOf('string');
	});

	it('allows custom message and suggestion overrides', () => {
		const result = createResponse.error(
			ErrorCode.BAG_NOT_FOUND,
			STATUS_CODE.NOT_FOUND,
			{ id: '123' },
			{
				customMessage: 'Custom message',
				customSuggestion: 'Custom suggestion',
			}
		);

		expect(result.message).toBe('Custom message');
		expect(result.suggestion).toBe('Custom suggestion');
		expect(result.error).toEqual({ id: '123' });
	});
});

describe('createResponse.invalidRequestError()', () => {
	it('returns standardized invalid request response', () => {
		const fieldErrors = {
			email: {
				_errors: ['Invalid email'],
			},
		};

		const result = createResponse.invalidRequestError(fieldErrors);

		expect(result.success).toBe(false);
		expect(result.status).toBe(STATUS_CODE.BAD_REQUEST);
		expect(result.code).toBe(ErrorCode.INVALID_REQUEST_DATA);
		expect(result.message).toBe(
			ErrorMessages[ErrorCode.INVALID_REQUEST_DATA]
		);
		expect(result.suggestion).toBe(
			ErrorSuggestions[ErrorCode.INVALID_REQUEST_DATA]
		);
		expect(result.fieldErrors).toEqual(fieldErrors);
		expect(result.timestamp).toBeTypeOf('string');
	});

	it('allows custom message and suggestion overrides', () => {
		const fieldErrors = {
			password: {
				_errors: ['Too short'],
			},
		};

		const result = createResponse.invalidRequestError(fieldErrors, {
			customMessage: 'Invalid form data',
			customSuggestion: 'Fix the highlighted fields',
		});

		expect(result.message).toBe('Invalid form data');
		expect(result.suggestion).toBe('Fix the highlighted fields');
	});
});

describe('apiResponseMap.ok()', () => {
	it('returns success response with 200 status', () => {
		const result = apiResponseMap.ok([{ id: 1 }], 'BAGS_FETCHED');

		expect(result.success).toBe(true);
		expect(result.status).toBe(STATUS_CODE.OK);
		expect(result.message).toBe(SuccessMessages.BAGS_FETCHED);
	});
});

describe('apiResponseMap.created()', () => {
	it('returns success response with 201 status', () => {
		const result = apiResponseMap.created({ id: 1 }, 'BAG_CREATED');

		expect(result.status).toBe(STATUS_CODE.CREATED);
		expect(result.success).toBe(true);
	});
});

describe('apiResponseMap.notFound()', () => {
	it('returns 404 error response', () => {
		const result = apiResponseMap.notFound(ErrorCode.BAG_NOT_FOUND);

		expect(result.status).toBe(STATUS_CODE.NOT_FOUND);
		expect(result.code).toBe(ErrorCode.BAG_NOT_FOUND);
	});
});

describe('apiResponseMap.badRequest()', () => {
	it('returns 400 error response', () => {
		const result = apiResponseMap.badRequest(ErrorCode.VALIDATION_ERROR);

		expect(result.status).toBe(STATUS_CODE.BAD_REQUEST);
	});
});

describe('apiResponseMap.invalidRequest()', () => {
	it('returns invalid request response with 400 status', () => {
		const fieldErrors = {
			username: {
				_errors: ['Required'],
			},
		};

		const result = apiResponseMap.invalidRequest(fieldErrors);

		expect(result.success).toBe(false);
		expect(result.status).toBe(STATUS_CODE.BAD_REQUEST);
		expect(result.code).toBe(ErrorCode.INVALID_REQUEST_DATA);
		expect(result.fieldErrors).toEqual(fieldErrors);
	});

	it('forwards custom overrides correctly', () => {
		const fieldErrors = {
			email: {
				_errors: ['Invalid'],
			},
		};

		const result = apiResponseMap.invalidRequest(fieldErrors, {
			customMessage: 'Bad payload',
		});

		expect(result.message).toBe('Bad payload');
	});

	it('does not include generic error property', () => {
		const result = apiResponseMap.invalidRequest({});

		expect('error' in result).toBe(false);
		expect('fieldErrors' in result).toBe(true);
	});
});

describe('apiResponseMap.unauthorized()', () => {
	it('returns 401 error response', () => {
		const result = apiResponseMap.unauthorized(ErrorCode.TOKEN_EXPIRED);

		expect(result.status).toBe(STATUS_CODE.UNAUTHORIZED);
	});
});

describe('apiResponseMap.forbidden()', () => {
	it('returns 403 error response', () => {
		const result = apiResponseMap.forbidden(ErrorCode.ACCESS_DENIED);

		expect(result.status).toBe(403);
	});
});

describe('apiResponseMap.serverError()', () => {
	it('returns 500 error response', () => {
		const result = apiResponseMap.serverError(ErrorCode.DATABASE_ERROR);

		expect(result.status).toBe(STATUS_CODE.INTERNAL_ERROR);
	});
});
