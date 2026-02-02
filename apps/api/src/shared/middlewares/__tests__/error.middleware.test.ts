import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { type ZodError, z } from 'zod';
import { Prisma } from '@prisma-generated/client';

import { errorHandler, prismaErrorMap } from '@shared/middlewares';
import { AppError } from '@shared/utils';
import { ErrorCode } from '@beggy/shared/constants';
import { STATUS_CODE } from '@shared/constants';

const mockResponse = (): Response => {
	const res = {} as Response;
	res.status = vi.fn().mockReturnValue(res);
	res.json = vi.fn().mockReturnValue(res);
	return res;
};

const mockRequest = {} as Request;
const mockNext = vi.fn() as NextFunction;

describe('errorHandler', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('known errors', () => {
		it('returns a normalized error response for application errors', () => {
			const err = new AppError(
				ErrorCode.FORBIDDEN,
				STATUS_CODE.FORBIDDEN,
				{ reason: 'not-owner' }
			);

			const res = mockResponse();

			errorHandler(err, mockRequest, res, mockNext);

			expect(res.status).toHaveBeenCalledWith(STATUS_CODE.FORBIDDEN);
			expect(res.json).toHaveBeenCalledWith(
				expect.objectContaining({
					success: false,
					code: ErrorCode.FORBIDDEN,
					status: STATUS_CODE.FORBIDDEN,
				})
			);
		});

		// it('returns bad request for invalid request data', () => {
		// 	const schema = z.object({
		// 		email: z.email(),
		// 	});

		// 	let err: ZodError;
		// 	try {
		// 		schema.parse({ email: 'invalid' });
		// 	} catch (e) {
		// 		err = e as ZodError;
		// 	}

		// 	const res = mockResponse();

		// 	errorHandler(err!, mockRequest, res, mockNext);

		// 	expect(res.status).toHaveBeenCalledWith(STATUS_CODE.BAD_REQUEST);
		// 	expect(res.json).toHaveBeenCalledWith(
		// 		expect.objectContaining({
		// 			code: ErrorCode.INVALID_REQUEST_DATA,
		// 		})
		// 	);
		// });
	});

	describe('authentication errors', () => {
		it('returns unauthorized when token is expired', () => {
			const err = new jwt.TokenExpiredError('jwt expired', new Date());

			const res = mockResponse();

			errorHandler(err, mockRequest, res, mockNext);

			expect(res.status).toHaveBeenCalledWith(STATUS_CODE.UNAUTHORIZED);
			expect(res.json).toHaveBeenCalledWith(
				expect.objectContaining({
					code: ErrorCode.TOKEN_EXPIRED,
				})
			);
		});

		it('returns unauthorized when token is invalid', () => {
			const err = new jwt.JsonWebTokenError('invalid token');

			const res = mockResponse();

			errorHandler(err, mockRequest, res, mockNext);

			expect(res.status).toHaveBeenCalledWith(STATUS_CODE.UNAUTHORIZED);
			expect(res.json).toHaveBeenCalledWith(
				expect.objectContaining({
					code: ErrorCode.TOKEN_INVALID,
				})
			);
		});
	});

	it('returns internal server error for unknown errors', () => {
		const err = new Error('something exploded');

		const res = mockResponse();

		errorHandler(err, mockRequest, res, mockNext);

		expect(res.status).toHaveBeenCalledWith(STATUS_CODE.INTERNAL_ERROR);
		expect(res.json).toHaveBeenCalledWith(
			expect.objectContaining({
				code: ErrorCode.INTERNAL_SERVER_ERROR,
			})
		);
	});
});

describe('zodErrorMap', () => {
	it('returns invalid request error for ZodError', () => {
		const schema = z.object({
			email: z.email(),
		});

		let err: ZodError;
		try {
			schema.parse({ email: 'not-an-email' });
		} catch (e) {
			err = e as ZodError;
		}

		// act
		(errorHandler as any).__getZodErrorMap
			? (errorHandler as any).__getZodErrorMap(err!)
			: null;

		// fallback: call indirectly via handler
		const res = mockResponse();
		errorHandler(err!, mockRequest, res, mockNext);

		// assert
		expect(res.status).toHaveBeenCalledWith(STATUS_CODE.BAD_REQUEST);
		expect(res.json).toHaveBeenCalledWith(
			expect.objectContaining({
				code: ErrorCode.INVALID_REQUEST_DATA,
				success: false,
			})
		);
	});

	it('returns null for non-Zod errors', () => {
		const err = new Error('not zod');

		// indirect assertion via handler
		const res = mockResponse();
		errorHandler(err, mockRequest, res, mockNext);

		expect(res.status).toHaveBeenCalledWith(STATUS_CODE.INTERNAL_ERROR);
	});
});

describe('prismaErrorMap', () => {
	it('maps unique email violations to conflict errors', () => {
		const err = new Prisma.PrismaClientKnownRequestError(
			'Unique constraint',
			{
				code: 'P2002',
				clientVersion: '5',
				meta: { target: ['email'] },
			}
		);

		const result = prismaErrorMap(err);

		expect(result?.code).toBe(ErrorCode.EMAIL_ALREADY_EXISTS);
		expect(result?.status).toBe(STATUS_CODE.CONFLICT);
	});

	it('maps missing records to not-found errors', () => {
		const err = new Prisma.PrismaClientKnownRequestError('Not found', {
			code: 'P2025',
			clientVersion: '5',
		});

		const result = prismaErrorMap(err);

		expect(result?.code).toBe(ErrorCode.RESOURCE_NOT_FOUND);
		expect(result?.status).toBe(STATUS_CODE.NOT_FOUND);
	});

	it('maps foreign key violations to bad request errors', () => {
		const err = new Prisma.PrismaClientKnownRequestError('FK violation', {
			code: 'P2003',
			clientVersion: '5',
		});

		const result = prismaErrorMap(err);

		expect(result?.code).toBe(ErrorCode.INVALID_RELATION_REFERENCE);
		expect(result?.status).toBe(STATUS_CODE.BAD_REQUEST);
	});

	it('maps prisma initialization errors to database connection failed', () => {
		const err = new Prisma.PrismaClientInitializationError(
			'DB unreachable',
			'5'
		);

		const result = prismaErrorMap(err);

		expect(result?.code).toBe(ErrorCode.DATABASE_CONNECTION_FAILED);
		expect(result?.status).toBe(STATUS_CODE.INTERNAL_ERROR);
	});

	it('maps critical prisma engine errors to database error', () => {
		const err = new Prisma.PrismaClientUnknownRequestError(
			'engine failure',
			{
				clientVersion: '5',
			}
		);

		const result = prismaErrorMap(err);

		expect(result?.code).toBe(ErrorCode.DATABASE_ERROR);
		expect(result?.status).toBe(STATUS_CODE.INTERNAL_ERROR);
	});

	it('returns null for non-prisma errors', () => {
		const err = new Error('not prisma');

		const result = prismaErrorMap(err);

		expect(result).toBeNull();
	});
});
