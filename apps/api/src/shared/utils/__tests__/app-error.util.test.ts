import { describe, it, expect } from 'vitest';

import { AppError, appErrorMap } from '@shared/utils';

import { ErrorCode, ErrorMessages } from '@beggy/shared/constants';

import { STATUS_CODE } from '@shared/constants';

describe('AppError', () => {
	it('creates error with resolved message from constants', () => {
		const error = new AppError(
			ErrorCode.VALIDATION_ERROR,
			STATUS_CODE.BAD_REQUEST
		);

		expect(error).toBeInstanceOf(Error);
		expect(error.name).toBe('AppError');
		expect(error.code).toBe(ErrorCode.VALIDATION_ERROR);
		expect(error.status).toBe(STATUS_CODE.BAD_REQUEST);
		expect(error.message).toBe(ErrorMessages[ErrorCode.VALIDATION_ERROR]);
	});

	it('uses custom message when provided', () => {
		const error = new AppError(
			ErrorCode.BAG_NOT_FOUND,
			STATUS_CODE.NOT_FOUND,
			undefined,
			{ customMessage: 'Custom message' }
		);

		expect(error.message).toBe('Custom message');
	});

	it('preserves underlying cause when it is an Error', () => {
		const cause = new Error('Database failed');

		const error = new AppError(
			ErrorCode.DATABASE_ERROR,
			STATUS_CODE.INTERNAL_ERROR,
			cause
		);

		expect(error.cause).toBe(cause);
	});

	it('does not attach non-Error cause to native cause property', () => {
		const error = new AppError(
			ErrorCode.DATABASE_ERROR,
			STATUS_CODE.INTERNAL_ERROR,
			{ reason: 'timeout' }
		);

		expect(error.cause).toBeUndefined();
	});

	it('is immutable after creation', () => {
		const error = new AppError(
			ErrorCode.VALIDATION_ERROR,
			STATUS_CODE.BAD_REQUEST
		);

		expect(Object.isFrozen(error)).toBe(true);
	});
});

describe('appErrorMap.notFound()', () => {
	it('creates error with 404 status', () => {
		const error = appErrorMap.notFound(ErrorCode.USER_NOT_FOUND);

		expect(error).toBeInstanceOf(AppError);
		expect(error.status).toBe(STATUS_CODE.NOT_FOUND);
	});
});

describe('appErrorMap.badRequest()', () => {
	it('creates error with 400 status', () => {
		const error = appErrorMap.badRequest(ErrorCode.VALIDATION_ERROR);

		expect(error.status).toBe(STATUS_CODE.BAD_REQUEST);
	});
});

describe('appErrorMap.invalidRequest()', () => {
	it('creates invalid request error with fixed code and 400 status', () => {
		const fieldErrors = {
			email: {
				_errors: ['Invalid email format'],
			},
		};

		const error = appErrorMap.invalidRequest(fieldErrors);

		expect(error).toBeInstanceOf(AppError);
		expect(error.code).toBe(ErrorCode.INVALID_REQUEST_DATA);
		expect(error.status).toBe(STATUS_CODE.BAD_REQUEST);
	});

	it('does not attach field-level errors to native error cause', () => {
		const fieldErrors = {
			password: {
				_errors: ['Too short'],
			},
		};

		const error = appErrorMap.invalidRequest(fieldErrors);

		expect(error.cause).toBeUndefined();
	});

	it('respects custom message overrides', () => {
		const fieldErrors = {
			username: {
				_errors: ['Required'],
			},
		};

		const error = appErrorMap.invalidRequest(fieldErrors, {
			customMessage: 'Invalid payload',
		});

		expect(error.message).toBe('Invalid payload');
	});
});

describe('appErrorMap.unauthorized()', () => {
	it('creates error with 401 status', () => {
		const error = appErrorMap.unauthorized(ErrorCode.TOKEN_EXPIRED);

		expect(error.status).toBe(STATUS_CODE.UNAUTHORIZED);
	});
});

describe('appErrorMap.forbidden()', () => {
	it('creates error with 403 status', () => {
		const error = appErrorMap.forbidden(ErrorCode.ACCESS_DENIED);

		expect(error.status).toBe(STATUS_CODE.FORBIDDEN);
	});
});

describe('appErrorMap.conflict()', () => {
	it('creates error with 409 status', () => {
		const error = appErrorMap.conflict(ErrorCode.EMAIL_ALREADY_EXISTS);

		expect(error.status).toBe(STATUS_CODE.CONFLICT);
	});
});

describe('appErrorMap.serverError()', () => {
	it('creates error with 500 status', () => {
		const error = appErrorMap.serverError(ErrorCode.DATABASE_ERROR);

		expect(error.status).toBe(STATUS_CODE.INTERNAL_ERROR);
	});
});
