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
import jwt from 'jsonwebtoken';

import type { Request, Response, NextFunction } from 'express';
import { ZodError, treeifyError } from 'zod';

import { Prisma } from '@prisma-generated/client';

import { ErrorCode } from '@beggy/shared/constants';

import { STATUS_CODE } from '@shared/constants';

import type { FieldErrorsTree } from '@beggy/shared/types';

import {
	AppError,
	createResponse,
	appErrorMap,
	formatValidationError,
	apiResponseMap,
} from '@shared/utils';

const { JsonWebTokenError, TokenExpiredError } = jwt;

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
			case 'P2002': {
				const target = err.meta?.target;

				// Normalize target to array
				const fields = Array.isArray(target) ? target : [];

				if (fields.includes('email')) {
					return appErrorMap.conflict(
						ErrorCode.EMAIL_ALREADY_EXISTS,
						err
					);
				}

				return appErrorMap.badRequest(
					ErrorCode.RESOURCE_ALREADY_EXISTS,
					err
				);
			}
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
 * Maps a raw Zod schema validation failure into a normalized AppError.
 *
 * @remarks
 * - This mapper is intentionally narrow in responsibility.
 * - It ONLY handles errors originating from Zod schema parsing.
 * - Zod errors indicate malformed or untrusted request payloads
 *   (i.e. the request failed to meet the API contract).
 * - Business logic and domain validation errors are handled elsewhere.
 *
 * All formatting and field-level extraction is delegated to
 * `formatValidationError`, keeping this mapper focused on
 * error classification and normalization.
 *
 * @param err - An unknown error thrown during the request lifecycle
 * @returns
 * - A standardized AppError with code `INVALID_REQUEST_DATA`
 *   when the error is a ZodError
 * - `null` when the error is not handled by this mapper
 */
const zodErrorMap = (err: unknown): AppError | null => {
	if (err instanceof ZodError) {
		/**
		 * Transform the ZodError into a structured, field-based
		 * error tree that is safe and useful for API consumers.
		 *
		 * @remarks
		 * This output is intended for:
		 * - Field-level UI feedback
		 * - Debugging malformed requests
		 * - Consistent error payloads across endpoints
		 */
		const formattedError = formatValidationError(treeifyError(err));

		/**
		 * Wrap the formatted validation details in a standardized AppError.
		 *
		 * @remarks
		 * - Uses `INVALID_REQUEST_DATA` to explicitly signal that the
		 *   request payload failed schema validation.
		 * - Mapped to HTTP 400 (Bad Request).
		 * - Indicates a transport/schema-layer failure, not a
		 *   business-rule violation.
		 */
		return appErrorMap.invalidRequest(formattedError as FieldErrorsTree);
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
 * 2. Zod validation errors
 * 3. JWT authentication errors
 * 4. Prisma database errors
 * 5. Fallback internal server error
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
	 ** Already-normalized application errors
	 *
	 * These errors are trusted and should be returned immediately
	 * without further inspection.
	 */
	if (err instanceof AppError) {
		const response = createResponse.error(
			err.code,
			err.status,
			err.cause,
			err.options
		);
		return res.status(err.status).json(response);
	}

	/**
	 ** Zod validation errors (input/schema errors)
	 *
	 * These represent client-side mistakes and should return 400-level responses.
	 */
	const zodError = zodErrorMap(err);
	if (zodError) {
		return res
			.status(zodError.status)
			.json(
				apiResponseMap.invalidRequest(
					zodError.cause as Record<string, FieldErrorsTree>,
					zodError.options
				)
			);
	}

	/**
	 ** JWT authentication & authorization errors
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
	 *
	 * These usually indicate constraint violations or missing records.
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
	 ** Fallback — truly unknown or unhandled errors
	 *
	 * At this point, the error is unexpected and should be treated
	 * as an internal server error.
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
