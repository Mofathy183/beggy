import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { NextFunction, Request, Response } from 'express';
import { rateLimitHandler, routeNotFoundHandler } from '@shared/middlewares';
import { STATUS_CODE } from '@shared/constants';
import { ErrorCode } from '@beggy/shared/constants';

describe('rateLimitHandler', () => {
	let req: Partial<Request>;
	let res: Partial<Response>;

	beforeEach(() => {
		req = {};

		res = {
			status: vi.fn().mockReturnThis(),
			json: vi.fn(),
		};
	});

	it('rejects requests when rate limit is exceeded', () => {
		// Act
		rateLimitHandler(req as Request, res as Response);

		// Assert
		expect(res.status).toHaveBeenCalledWith(STATUS_CODE.TOO_MANY_REQUESTS);

		expect(res.json).toHaveBeenCalledWith(
			expect.objectContaining({
				success: false,
				code: ErrorCode.RATE_LIMITED,
			})
		);
	});
});

describe('routeNotFoundHandler', () => {
	let req: Partial<Request>;
	let res: Partial<Response>;
	let next: NextFunction;

	beforeEach(() => {
		req = {
			path: '/unknown-endpoint',
			method: 'GET',
		};

		res = {
			status: vi.fn().mockReturnThis(),
			json: vi.fn(),
		};

		next = vi.fn();
	});

	it('returns a not-found error', () => {
		// Act
		routeNotFoundHandler(req as Request, res as Response, next);

		// Assert
		expect(res.status).toHaveBeenCalledWith(STATUS_CODE.NOT_FOUND);

		expect(res.json).toHaveBeenCalledWith(
			expect.objectContaining({
				success: false,
				code: ErrorCode.ROUTE_NOT_FOUND,
			})
		);
	});

	it('includes request path and method in the error', () => {
		// Act
		routeNotFoundHandler(req as Request, res as Response, next);

		// Assert
		expect(res.json).toHaveBeenCalledWith(
			expect.objectContaining({
				error: expect.objectContaining({
					requestedPath: '/unknown-endpoint',
					method: 'GET',
				}),
			})
		);
	});
});
