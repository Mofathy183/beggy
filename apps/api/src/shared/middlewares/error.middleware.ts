/**
 * error.middleware.ts
 * -------------------
 * Centralized Express error-handling middleware.
 *
 * Responsibilities:
 * - Normalize all errors into AppError
 * - Map infrastructure/library errors (Prisma, JWT) to domain ErrorCode
 * - Produce consistent Beggy-style API responses using createResponse
 *
 * This file is the ONLY place where:
 * - HTTP responses for errors are created
 * - Library-specific errors are interpreted
 */

import type { Request, Response, NextFunction } from 'express';
import { ErrorCode } from '@beggy/shared/constants';
import { STATUS_CODE } from '@shared/constants';
import { AppError, createResponse, appErrorMap } from '@shared/utils';
import { Prisma } from '@prisma-generated/client';
import { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';

/**
 * prismaErrorMap
 * --------------
 * Maps Prisma-specific errors to domain-level AppError instances.
 *
 * @remarks
 * - Prisma error codes are considered implementation details.
 * - This mapper translates them into stable API error codes
 *   that are safe to expose to clients.
 * - Returns `null` if the error is not a Prisma error.
 *
 * @param err - Unknown error thrown from any layer
 * @returns AppError if Prisma-related, otherwise null
 */
export const prismaErrorMap = (err: unknown): AppError | null => {
	/**
	 * Known Prisma request errors (constraint violations, missing records, etc.)
	 */
	if (err instanceof Prisma.PrismaClientKnownRequestError) {
		switch (err.code) {
			/**
			 * Unique constraint violation
			 * Example: duplicate email, username, etc.
			 */
			case 'P2002':
				return appErrorMap.badRequest(
					ErrorCode.RESOURCE_ALREADY_EXISTS,
					err
				);
			/**
			 * Record not found
			 * - P2001: record does not exist
			 * - P2025: required record not found during update/delete
			 */
			case 'P2001':
			case 'P2025':
				return appErrorMap.notFound(ErrorCode.RESOURCE_NOT_FOUND, err);

			/**
			 * Foreign key constraint violation
			 * Example: referencing a non-existing related record
			 */
			case 'P2003':
				return appErrorMap.badRequest(
					ErrorCode.INVALID_RELATION_REFERENCE,
					err
				);

			/**
			 * Any other known Prisma request error
			 */
			default:
				return appErrorMap.serverError(ErrorCode.DATABASE_ERROR, err);
		}
	}

	/**
	 * Prisma initialization errors
	 * Example: invalid credentials, database unreachable
	 */
	if (err instanceof Prisma.PrismaClientInitializationError) {
		return appErrorMap.serverError(
			ErrorCode.DATABASE_CONNECTION_FAILED,
			err
		);
	}

	/**
	 * Critical Prisma engine failures
	 * - Rust panic
	 * - Unknown engine request errors
	 */
	if (
		err instanceof Prisma.PrismaClientRustPanicError ||
		err instanceof Prisma.PrismaClientUnknownRequestError
	) {
		return appErrorMap.serverError(ErrorCode.DATABASE_ERROR, err);
	}

	return null;
};

/**
 * jwtErrorMap
 * -----------
 * Maps JSON Web Token errors to authentication-related AppError instances.
 *
 * @remarks
 * - JWT errors are expected to originate from auth middleware.
 * - TokenExpiredError MUST be checked before JsonWebTokenError
 *   because it extends it.
 *
 * @param err - Unknown error thrown during token verification
 * @returns AppError if JWT-related, otherwise null
 */
const jwtErrorMap = (err: unknown): AppError | null => {
	/**
	 * Access or refresh token has expired
	 */
	if (err instanceof TokenExpiredError) {
		return appErrorMap.unauthorized(ErrorCode.TOKEN_EXPIRED, err);
	}

	/**
	 * Invalid, malformed, or tampered JWT
	 */
	if (err instanceof JsonWebTokenError) {
		return appErrorMap.unauthorized(ErrorCode.TOKEN_INVALID, err);
	}

	return null;
};

/**
 * errorHandler
 * ------------
 * Final Express error-handling middleware.
 *
 * @remarks
 * Error handling priority:
 * 1. AppError (already normalized)
 * 2. JWT errors
 * 3. Prisma errors
 * 4. Fallback internal server error
 *
 * This middleware must be registered LAST in the middleware chain.
 */
export const errorHandler = (
	err: unknown,
	_req: Request,
	res: Response,
	_next: NextFunction
) => {
	/**
	 ** Already normalized application error
	 */
	if (err instanceof AppError) {
		const response = createResponse.error(
			err.code,
			err.status,
			err.cause,
			err.options
		);
		res.status(err.status).json(response);
	}

	/**
	 ** JWT authentication errors
	 */
	const jwtError = jwtErrorMap(err);
	if (jwtError) {
		return res
			.status(jwtError.status)
			.json(
				createResponse.error(
					jwtError.code,
					jwtError.status,
					jwtError.cause,
					jwtError.options
				)
			);
	}

	/**
	 ** Prisma database errors
	 */
	const prismaError = prismaErrorMap(err);
	if (prismaError) {
		const response = createResponse.error(
			prismaError.code,
			prismaError.status,
			prismaError.cause,
			prismaError.options
		);

		return res.status(prismaError.status).json(response);
	}

	/**
	 ** Fallback — truly unknown or unhandled error
	 */
	const fallback = new AppError(
		ErrorCode.INTERNAL_SERVER_ERROR,
		STATUS_CODE.INTERNAL_ERROR,
		err
	);

	const response = createResponse.error(
		fallback.code,
		fallback.status,
		fallback.cause
	);

	return res.status(STATUS_CODE.INTERNAL_ERROR).json(response);
};
