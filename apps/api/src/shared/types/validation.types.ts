import { type ErrorCode } from '@beggy/shared/constants';
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
 * Represents validation errors for a single field or a nested structure.
 *
 * - Leaf nodes are arrays of error messages
 * - Nested objects represent structured schema paths
 *
 * Example:
 * ```ts
 * {
 *   name: ["Name is required"],
 *   age: {
 *     min: ["Must be at least 18"],
 *     max: ["Must be under 100"]
 *   }
 * }
 * ```
 */
export type ValidationFieldErrors =
	| string[]
	| { [key: string]: ValidationFieldErrors };

/**
 * Standard API response shape for validation errors.
 *
 * This response is returned when request input fails schema validation
 * before reaching business logic or controllers.
 */
export interface ValidationErrorResponse {
	/**
	 * Machine-readable error code identifying a validation failure.
	 */
	code: ErrorCode.VALIDATION_ERROR;

	/**
	 * Human-readable summary describing the validation issue.
	 */
	message: string;

	/**
	 * Optional guidance to help clients resolve the validation errors.
	 */
	suggestion?: string;

	/**
	 * Structured validation errors mapped by field name.
	 *
	 * Supports deeply nested schemas and array-based errors.
	 */
	fieldErrors: Record<string, ValidationFieldErrors>;
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
