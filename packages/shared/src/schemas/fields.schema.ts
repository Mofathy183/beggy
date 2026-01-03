import { REGEX } from '@/constants';
import * as z from 'zod';
import {
	createArrayField,
	createNameField,
	createNumberField,
	safeTrim,
} from '@/utils';
import type { NameFieldType, NumericEntity, NumericMetric } from '@/types';

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
	 * Email field validator.
	 *
	 * - Enforces valid email format
	 * - Normalizes casing (lowercase)
	 * - Trims whitespace
	 * - Returns `null` for empty optional values
	 *
	 * @param isRequired - Whether the email is required
	 */
	email: (isRequired: boolean = true) => {
		const baseSchema = z
			.email({
				error: 'That email doesn’t quite look right — let’s make sure it’s something like traveler@example.com.',
			})
			.trim();

		if (isRequired)
			return baseSchema
				.min(1, {
					error: 'I’ll need your email before we can move forward — even seasoned travelers need a boarding pass!',
				})
				.max(255, {
					error: 'That email’s a bit long — let’s keep it under 255 characters so systems don’t get confused.',
				})
				.transform((val) => safeTrim(val)?.toLowerCase());

		return baseSchema
			.max(255, {
				error: 'That email’s looking a bit long — shorter is smoother for logins.',
			})
			.nullish()
			.transform((val) => safeTrim(val)?.toLowerCase());
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
				.transform(safeTrim);
		}
		return baseSchema
			.max(64, {
				error: 'That password looks long — anything under 64 characters keeps systems happy.',
			})
			.nullish()
			.transform(safeTrim);
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
	 * ISO date field validator.
	 *
	 * - Accepts ISO date strings
	 * - Enforces reasonable historical and future bounds
	 *
	 * @param isRequired - Whether date is required
	 */
	date: (isRequired: boolean = true) => {
		const baseSchema = z.iso.date({
			error: 'That doesn’t look like a valid date — let’s try something like 2025-12-26.',
		});

		return isRequired
			? baseSchema
					.min(new Date('1900-01-01').getTime(), {
						error: 'That date’s a bit too far back in time — let’s stay within the modern travel era.',
					})
					.max(new Date().getTime(), {
						error: 'That date’s ahead of schedule — future trips aren’t bookable just yet!',
					})
					.transform(safeTrim)
			: baseSchema.nullish().transform(safeTrim);
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
					.transform(safeTrim)
			: baseSchema.nullish().transform(safeTrim);
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

	array: (elementSchema: z.ZodTypeAny, isRequired: boolean = true) =>
		createArrayField(elementSchema, isRequired),
};
