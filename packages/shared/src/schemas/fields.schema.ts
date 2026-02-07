import * as z from 'zod';
import { REGEX } from '../constants/constraints';
import {
	createArrayField,
	createNameField,
	createNumberField,
	normalizeTrim,
	normalizeDate,
} from '../utils/schema.util';
import type {
	NameFieldType,
	NumericEntity,
	NumericMetric,
} from '../types/schema.types';

/**
 * Centralized field schema factory.
 *
 * This object exposes reusable, domain-agnostic Zod schema builders
 * for primitive fields (string, number, enum, date, etc.).
 *
 * Goals:
 * - Consistent validation rules across the entire application
 * - Single source of truth for constraints and transformations
 * - Backend + frontend schema parity
 */
export const FieldsSchema = {
	/**
	 * Creates a validated name field.
	 *
	 * Used for human-readable names such as:
	 * - Person names
	 * - Product names
	 * - Brand names
	 * - Place names
	 *
	 * Validation rules (regex, length, messages) are resolved
	 * from `NAME_CONFIG` based on the provided type.
	 *
	 * @param fieldName - Human-readable label used in error messages
	 * @param type - Name domain (person | product | brand | place)
	 * @param isRequired - Whether the field is mandatory
	 *
	 * @example
	 * FieldsSchema.name('First name', 'person')
	 */
	name: (
		fieldName: string,
		type: NameFieldType,
		isRequired: boolean = true
	) => createNameField(type, fieldName, isRequired),

	/**
	 * Creates a Zod schema for validating email input.
	 *
	 * Responsibilities:
	 * - Validates email format using Zod's built-in email validator
	 * - Trims leading and trailing whitespace
	 * - Normalizes email casing to lowercase
	 * - Preserves `null` and `undefined` when the field is optional
	 *
	 * Design notes:
	 * - Email addresses are treated as case-insensitive across the system
	 * - Uppercase input is normalized rather than rejected for better UX
	 * - Normalization occurs *before* validation to ensure consistent storage
	 * - Length constraints are enforced to align with common DB limits (≤ 255 chars)
	 *
	 * Usage:
	 * - Use `email()` for required email fields
	 * - Use `email(false)` for optional email fields
	 *
	 * @param isRequired - Whether the email field is required (defaults to `true`)
	 * @returns A Zod schema for validating and normalizing email input
	 */
	email: (isRequired: boolean = true) => {
		/**
		 * Base email schema with preprocessing applied.
		 *
		 * Preprocessing runs before validation and is responsible for:
		 * - Short-circuiting nullish values so optional semantics are preserved
		 * - Trimming whitespace to avoid accidental user input errors
		 * - Normalizing casing to lowercase to ensure consistent comparison/storage
		 */
		const baseSchema = z.preprocess(
			(input) => {
				// Preserve null / undefined for optional fields
				if (input == null) return input;

				// Normalize string input before validation
				if (typeof input === 'string')
					return input.trim().toLowerCase();

				// Pass through all other input types untouched
				return input;
			},
			z
				.email({
					error: 'That email doesn’t quite look right — let’s make sure it’s something like traveler@example.com.',
				})
				.max(255, {
					error: 'That email’s looking a bit long — shorter is smoother for logins.',
				})
		);

		/**
		 * Return required or optional variant of the schema.
		 *
		 * `.nullish()` allows both `null` and `undefined`, which is useful for:
		 * - PATCH / partial update endpoints
		 * - Optional profile fields
		 */
		return isRequired ? baseSchema : baseSchema.nullish();
	},

	/**
	 * Password field validator.
	 *
	 * Enforces:
	 * - Minimum and maximum length
	 * - Uppercase, lowercase, digit, and special character rules
	 * - No spaces
	 *
	 * ⚠️ This schema validates *input only*.
	 * Password hashing should always happen in the service layer.
	 *
	 * @param isRequired - Whether password is required
	 */
	password: (isRequired: boolean = true) => {
		const baseSchema = z.string().trim();

		if (isRequired) {
			return baseSchema
				.min(8, {
					error: 'From experience, at least 8 characters keeps your password strong enough for takeoff.',
				})
				.max(64, {
					error: 'That password’s a bit long — let’s trim it under 64 characters for easier handling.',
				})
				.regex(REGEX.HAS_LOWERCASE, {
					error: 'Add at least one lowercase letter — it keeps your password well-balanced.',
				})
				.regex(REGEX.HAS_UPPERCASE, {
					error: 'Include at least one uppercase letter — it adds that extra layer of security.',
				})
				.regex(REGEX.HAS_SPECIAL_CHARACTER, {
					error: 'Try adding a symbol like ! or @ — it helps keep things secure from stowaways.',
				})
				.regex(REGEX.NO_SPACES, {
					error: 'No spaces, please — passwords prefer to travel light.',
				})
				.regex(REGEX.HAS_DIGIT, {
					error: 'Pop in at least one number — every good password carries a digit or two.',
				})
				.regex(REGEX.PASSWORD_ALLOWED_CHARS, {
					error: 'Stick to standard letters, numbers, and symbols — nothing too exotic here.',
				})
				.transform(normalizeTrim);
		}
		return baseSchema
			.max(64, {
				error: 'That password looks long — anything under 64 characters keeps systems happy.',
			})
			.nullish()
			.transform(normalizeTrim);
	},

	/**
	 * Enum field validator.
	 *
	 * Useful for dropdowns, select inputs, and controlled vocabularies.
	 *
	 * @template E - Enum object type
	 * @param enumValues - Enum values object
	 * @param isRequired - Whether value is required
	 */
	enum: <E extends Record<string, string>>(
		enumValues: E,
		isRequired: boolean = true
	) => {
		const baseSchema = z.enum(enumValues, {
			error: 'That choice isn’t on the list — pick one from the dropdown so we’re on the same page.',
		});
		return isRequired ? baseSchema : baseSchema.nullish();
	},

	/**
	 * Date field validator.
	 *
	 * - Accepts JavaScript `Date` instances
	 * - Enforces reasonable historical and future bounds
	 * - Preserves nullish semantics for optional fields
	 *
	 * @param isRequired - Whether the date is required
	 */
	date: (isRequired: boolean = true) => {
		const MIN_DATE = new Date('1900-01-01');
		const MAX_DATE = new Date();

		const baseSchema = z.date({
			error: 'That doesn’t look like a valid date — let’s try something like 2025-12-26.',
		});

		return isRequired
			? baseSchema
					.min(MIN_DATE, {
						error: 'That date’s a bit too far back in time — let’s stay within the modern travel era.',
					})
					.max(MAX_DATE, {
						error: 'That date’s ahead of schedule — future trips aren’t bookable just yet!',
					})
					.transform(normalizeDate)
			: baseSchema.nullish().transform(normalizeDate);
	},

	/**
	 * URL field validator.
	 *
	 * - Validates standard URL format
	 * - Enforces safe URL characters
	 * - Trims input
	 *
	 * @param isRequired - Whether URL is required
	 */
	url: (isRequired: boolean = true) => {
		const baseSchema = z
			.url({
				error: 'That doesn’t quite look like a valid URL — something like https://example.com works best.',
			})
			.trim();

		return isRequired
			? baseSchema
					.min(10, {
						error: 'That link looks a bit short — check for typos or missing http(s).',
					})
					.max(2048, {
						error: 'That URL’s a bit long — shorter links travel better across forms.',
					})
					.regex(REGEX.URL_SAFE, {
						error: 'That URL includes some characters that don’t pack well — stick to standard ones like letters, numbers, and slashes.',
					})
					.transform(normalizeTrim)
			: baseSchema.nullish().transform(normalizeTrim);
	},

	/**
	 * Numeric field validator.
	 *
	 * Delegates validation rules (min, max, decimals)
	 * to `NUMBER_CONFIG` based on entity + metric.
	 *
	 * @param type - Numeric entity (bag | suitcase | item)
	 * @param metric - Metric within the entity (weight | capacity | volume | quantity)
	 * @param isRequired - Whether value is required
	 */
	number: <M extends NumericEntity>(
		type: M,
		metric: NumericMetric<M>,
		isRequired: boolean = true
	) => createNumberField(type, metric, isRequired),

	/**
	 * Array field validator.
	 *
	 * @remarks
	 * - Delegates validation logic to `createArrayField`
	 * - Provides a concise, consistent API for schema authors
	 * - Keeps field definitions declarative and readable
	 *
	 * @param elementSchema - Zod schema describing a single array element
	 * @param isRequired - Whether the array field is required (default: true)
	 *
	 * @returns A Zod schema validating an array of elements
	 */
	array: (elementSchema: z.ZodTypeAny, isRequired: boolean = true) =>
		createArrayField(elementSchema, isRequired),
};
