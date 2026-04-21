import type { Request, Response, NextFunction } from 'express';
import type { ValidationSchema } from '@shared/types';
import { reconstructQuery } from '@shared/utils';
import type { ZodType } from 'zod';
import { ParamsSchema } from '@beggy/shared/schemas';

/**
 * Middleware factory for validating and normalizing Express request data.
 *
 * @param schema - Zod schemas for body, query, and/or params
 * @returns Express middleware
 *
 * @remarks
 * - Validates request data before reaching controllers
 * - Replaces request values with parsed (trusted) data
 * - Supports shared schemas across API and frontend
 *
 * Mutates:
 * - `req.body`
 * - `req.query`
 * - `req.params`
 *
 * Errors are forwarded to the global error handler.
 */
export const validateRequest =
	(schema: ValidationSchema) =>
	async (req: Request, _res: Response, next: NextFunction) => {
		try {
			/**
			 * Validate and parse request body
			 */
			if (schema.body) {
				req.body = await schema.body.parseAsync(req.body);
			}

			/**
			 * Validate and parse query parameters
			 *
			 * Cast is safe because:
			 * - Zod has already validated the shape at runtime
			 * - Express typings are structural and intentionally loose
			 */
			if (schema.query) {
				// Reconstruct nested objects from dot-notation keys + coerce numbers
				const reconstructed = reconstructQuery(
					/* eslint-disable @typescript-eslint/no-explicit-any */
					req.query as Record<string, any>
				);
				const parsedQuery =
					await schema.query.parseAsync(reconstructed);
				Object.assign(req.query, parsedQuery);
			}

			/**
			 * Validate and parse route parameters
			 *
			 * Parameters are expected to be object-shaped
			 * (e.g. `{ id: string }`)
			 */
			if (schema.params) {
				const parsedParams = await schema.params.parseAsync(req.params);
				req.params = parsedParams as typeof req.params;
			}

			next();
		} catch (error: unknown) {
			/**
			 * Forward validation errors to the global error handler
			 */
			next(error);
		}
	};

/**
 * Convenience middleware for validating only the request body.
 *
 * @param schema - Zod schema for `req.body`
 * @returns Express validation middleware
 */
export const validateBody = (schema: ZodType) =>
	validateRequest({ body: schema });

/**
 * Convenience middleware for validating only query parameters.
 *
 * @param schema - Zod schema for `req.query`
 * @returns Express validation middleware
 */
export const validateQuery = (schema: ZodType) =>
	validateRequest({ query: schema });

/**
 * Middleware for validating a single UUID route parameter.
 *
 * @remarks
 * - Designed for routes that accept **one UUID parameter** (e.g. `:id`)
 * - Uses a shared Zod schema to ensure consistent UUID validation
 * - Replaces `req.params` with the parsed and normalized result
 * - Throws a `ZodError` on validation failure (handled by the global error handler)
 *
 * This middleware intentionally:
 * - Does NOT send responses
 * - Does NOT format errors
 * - Delegates all error handling to the global error handler
 *
 * @example
 * ```ts
 * router.get(
 *   '/users/:id',
 *   validateUuidParam,
 *   getById
 * );
 * ```
 */
export const validateUuidParam = validateRequest({
	params: ParamsSchema.uuid,
});
