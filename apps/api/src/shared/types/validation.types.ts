import { type ZodType } from 'zod';

/**
 * Validation schema definition used by `validateRequest` middleware.
 *
 * @remarks
 * - Each property corresponds to a specific part of the HTTP request
 * - All schemas are optional, allowing selective validation per route
 * - Zod schemas are expected to throw `ZodError` on invalid input
 *
 * The validated and parsed data will replace the corresponding
 * `req.body`, `req.query`, or `req.params` values.
 *
 * @example
 * ```ts
 * validateRequest({
 *   body: createUserSchema,
 *   params: ParamsSchema.uuid
 * })
 * ```
 */
export interface ValidationSchema {
	/**
	 * Schema for validating `req.body`
	 */
	body?: ZodType;

	/**
	 * Schema for validating `req.query`
	 */
	query?: ZodType;

	/**
	 * Schema for validating `req.params`
	 */
	params?: ZodType;
}

/**
 * Internal representation of Zod's treeifyError error structure.
 *
 * This type mirrors the runtime shape produced by `z.treeifyError()`
 * and is used internally for safely traversing and formatting errors.
 *
 * ⚠️ This type should NOT be exposed outside of validation utilities.
 */
export type ZodErrorTree = {
	/**
	 * Validation error messages at the current node level.
	 */
	errors: unknown[];

	/**
	 * Nested validation errors for object properties.
	 */
	properties?: Record<string, ZodErrorTree>;

	/**
	 * Nested validation errors for array items (index-based).
	 */
	items?: ZodErrorTree[];
};
