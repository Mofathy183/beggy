import * as z from 'zod';
import type {
	NameFieldType,
	NumericEntity,
	NumericMetric,
} from '../types/schema.types.js';
import { NAME_CONFIG, NUMBER_CONFIG } from '../constants/constraints.js';

/**
 * Normalizes a string value by trimming surrounding whitespace.
 *
 * - Trims the string when a value exists
 * - Preserves `null` and `undefined` exactly
 *
 * Intended for normalizing optional string inputs in shared
 * frontend and backend schemas (e.g. with Zod `.transform()`).
 *
 * @param val - The string value to trim, or a nullish value
 * @returns The trimmed string, or the original nullish value
 */
export const normalizeTrim = (
	val: string | null | undefined
): string | null | undefined => {
	// Preserve null and undefined for optional fields
	if (val == null) return val;

	return val.trim();
};

/**
 * Normalizes a numeric value by rounding it to a fixed number of decimals.
 *
 * - Rounds the number when a value exists
 * - Preserves `null` and `undefined` exactly
 *
 * Useful for normalizing optional numeric inputs before
 * persistence or response serialization.
 *
 * @param val - The numeric value to round, or a nullish value
 * @param decimals - Number of decimal places to round to
 * @returns The rounded number, or the original nullish value
 */
export const normalizeRound = (
	val: number | null | undefined,
	decimals: number
): number | null | undefined => {
	// Preserve null and undefined for optional fields
	if (val == null) return val;

	return Number(val.toFixed(decimals));
};

/**
 * Normalizes a Date value while preserving nullish semantics.
 *
 * - Accepts a JavaScript `Date` instance
 * - Returns a new `Date` instance to avoid accidental mutation
 * - Preserves `null` and `undefined` exactly
 *
 * Intended for use with Zod `.transform()` in shared schemas where:
 * - Validation operates on `Date` objects
 * - Schemas are shared between frontend and backend
 * - Optional fields must retain their nullish semantics
 *
 * @param val - A `Date` instance, or a nullish value
 * @returns A normalized `Date` instance, or the original nullish value
 */
export const normalizeDate = (
	val: Date | null | undefined
): Date | null | undefined => {
	if (val == null) return val;

	// Return a new Date instance to avoid mutation side effects
	return new Date(val);
};

/**
 * Creates a name field validator based on the specified type.
 * Handles both required and optional variants consistently.
 *
 * @param type - Type of name field (person, product, brand, place)
 * @param fieldName - The display name of the field for error messages
 * @param isRequired - Whether the field is mandatory
 * @returns Configured Zod schema for the name field
 */
export const createNameField = (
	type: NameFieldType,
	fieldName: string,
	isRequired: boolean = true
) => {
	const { regex, defaultMaxLength, defaultMinLength, messages } =
		NAME_CONFIG[type];

	const baseSchema = z.string().trim(); // normalize input by trimming edges

	if (isRequired)
		return baseSchema
			.min(defaultMinLength, { error: messages.minLength(fieldName) }) // ✅ Required has .min(defaultMinLength)
			.max(defaultMaxLength, { error: messages.maxLength(fieldName) })
			.regex(regex, { error: messages.regex(fieldName) })
			.transform(normalizeTrim);

	return baseSchema
		.max(defaultMaxLength, { error: messages.maxLength(fieldName) })
		.nullish()
		.transform(normalizeTrim);
};

/**
 * Creates a numeric Zod schema based on domain configuration.
 *
 * - Enforces positivity
 * - Applies min/max constraints
 * - Rounds values to configured precision
 * - Normalizes optional values via `nullish()`
 *
 * @param type - Numeric entity (bag | suitcase | item)
 * @param metric - Metric type (weight | volume | capacity | quantity)
 * @param isRequired - Whether the field is mandatory
 */
export const createNumberField = <M extends NumericEntity>(
	type: M,
	metric: NumericMetric<M>,
	isRequired: boolean = true
) => {
	const { gte, lte, decimals, messages } = NUMBER_CONFIG[type][metric];

	const baseSchema = z
		.number({ error: messages.number })
		.positive({ error: messages.positive });

	return isRequired
		? baseSchema
				.gte(gte, { error: messages.gte }) // alias for .min()
				.lte(lte, { error: messages.lte }) // alias for .max()
				.transform((val) => normalizeRound(val, decimals))
		: baseSchema
				.nullish()
				.transform((val) => normalizeRound(val, decimals));
};

/**
 * Creates a reusable array field validator with consistent constraints and UX-friendly messages.
 *
 * @remarks
 * - Designed for shared usage across web forms and API payloads
 * - Enforces upper bounds to protect performance and data integrity
 * - Uses friendly, human-centered error messages for better UX
 *
 * @param elementSchema - Zod schema describing a single array element
 * @param isRequired - Whether at least one element must be provided (default: true)
 *
 * @returns A Zod array schema with appropriate validation rules applied
 */
export const createArrayField = (
	elementSchema: z.ZodTypeAny,
	isRequired: boolean = true
) => {
	/**
	 * Base array schema.
	 *
	 * @remarks
	 * - No defaults are applied to avoid implicit data creation
	 * - Element validation is delegated entirely to elementSchema
	 */
	const baseSchema = z.array(elementSchema);

	return isRequired
		? baseSchema
				/**
				 * Required array validation.
				 *
				 * @remarks
				 * - Ensures the array contains at least one element
				 * - Prevents empty submissions when data is mandatory
				 */
				.min(1, {
					error: 'Looks like your list is a bit light — let’s make sure there’s at least one item packed before we go.',
				})
				/**
				 * Maximum size constraint.
				 *
				 * @remarks
				 * - Protects against excessively large payloads
				 * - Helps maintain predictable UX and backend performance
				 */
				.max(5, {
					error: 'That’s quite a list! Try trimming it down a little — traveling lighter keeps things smoother.',
				})
		: baseSchema
				/**
				 * Optional array validation.
				 *
				 * @remarks
				 * - Allows empty or undefined arrays
				 * - Still enforces an upper limit when values are provided
				 */
				.max(5, {
					error: 'You’ve got quite a few items there — maybe pare it back to essentials for an easier trip.',
				})
				.nullish();
};
