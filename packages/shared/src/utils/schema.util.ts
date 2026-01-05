import type {
	NameFieldConfig,
	NameFieldType,
	NumberConfigMap,
	NumericEntity,
	NumericMetric,
} from '@/types';
import { REGEX } from '@/constants';
import * as z from 'zod';

/**
 * Configuration for different name field types.
 * Centralizes validation rules and user-friendly error messages.
 */
export const NAME_CONFIG: Record<NameFieldType, NameFieldConfig> = {
	// =========================================================================
	// PERSON NAME
	// =========================================================================
	person: {
		regex: REGEX.PERSON_NAME,
		defaultMaxLength: 50,
		defaultMinLength: 2,
		messages: {
			maxLength(firstName) {
				return `“${firstName}” feels a bit long for a name. From experience, shorter names fit better on tickets and tags.`;
			},
			minLength(firstName) {
				return `“${firstName}” looks a bit short — could you add a few more letters so it feels complete?`;
			},
			regex(firstName) {
				return `“${firstName}” has a few unexpected characters. Let’s stick to letters and a touch of punctuation if needed.`;
			},
		},
	},

	// =========================================================================
	// PRODUCT NAME
	// =========================================================================
	product: {
		regex: REGEX.PRODUCT_NAME,
		defaultMaxLength: 100,
		defaultMinLength: 2,
		messages: {
			maxLength(firstName) {
				return `“${firstName}” might be a bit long for a product name — try trimming it down to something punchier.`;
			},
			minLength(firstName) {
				return `“${firstName}” seems a little too short — can you make it more descriptive?`;
			},
			regex(firstName) {
				return `“${firstName}” includes symbols that don’t quite fit a product label. Stick to clean letters and numbers.`;
			},
		},
	},

	// =========================================================================
	// BRAND NAME
	// =========================================================================
	brand: {
		regex: REGEX.BRAND_NAME,
		defaultMaxLength: 50,
		defaultMinLength: 2,
		messages: {
			maxLength(firstName) {
				return `“${firstName}” might stretch a bit too far for a brand name — shorter names tend to travel farther.`;
			},
			minLength(firstName) {
				return `“${firstName}” feels a bit short for a brand — maybe add a touch more flair?`;
			},
			regex(firstName) {
				return `“${firstName}” includes characters that don’t quite suit a brand name. Let’s keep it sleek and readable.`;
			},
		},
	},

	// =========================================================================
	// PLACE NAME
	// =========================================================================
	place: {
		regex: REGEX.PLACE_NAME,
		defaultMaxLength: 100,
		defaultMinLength: 2,
		messages: {
			maxLength(firstName) {
				return `“${firstName}” might be too long for a location name — shorter ones are easier to spot on maps.`;
			},
			minLength(firstName) {
				return `“${firstName}” seems a bit too short — double-check the spelling or add more detail.`;
			},
			regex(firstName) {
				return `“${firstName}” has characters that don’t quite fit typical place names. Try letters, commas, or hyphens instead.`;
			},
		},
	},
};

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
 * Normalizes an ISO date string into a JavaScript Date instance.
 *
 * - Converts valid ISO date strings (`YYYY-MM-DD`) to `Date`
 * - Preserves `null` and `undefined` values exactly
 *
 * This function is intended for use with Zod `.transform()` when:
 * - Schemas are shared between frontend and backend
 * - Date values arrive as strings from forms or APIs
 * - Optional fields must retain their nullish semantics
 *
 * @param val - ISO date string, or nullish value
 * @returns A Date instance, or the original nullish value
 */
export const normalizeIsoDate = (
	val: string | null | undefined
): Date | null | undefined => {
	// Preserve null and undefined for optional fields
	if (val == null) return val;

	// Convert ISO date string to JavaScript Date
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
 * Central numeric constraints map.
 *
 * Defines realistic, domain-driven boundaries
 * for all numeric fields in the system.
 *
 * Acts as a single source of truth for:
 * - Validation limits
 * - Decimal precision
 * - Error messaging
 */
export const NUMBER_CONFIG: NumberConfigMap = {
	// =========================================================================
	// BAG LIMITS
	// =========================================================================
	bag: {
		capacity: {
			gte: 1,
			lte: 150,
			decimals: 1,
			messages: {
				number: 'That doesn’t seem like a valid number — double-check your units before we lift off.',
				positive:
					'Let’s keep bag capacity above zero — can’t pack air, after all.',
				gte: 'That bag’s capacity seems a bit small — you’ll need room for souvenirs too.',
				lte: 'That capacity sounds huge! Most airlines might raise an eyebrow at that size.',
			},
		},
		weight: {
			gte: 1,
			lte: 50,
			decimals: 2,
			messages: {
				number: 'That doesn’t seem like a valid number — double-check your units before we lift off.',
				positive:
					'Bag weight must be more than zero — even an empty bag weighs something!',
				gte: 'That seems a bit too light — double-check your weight units just in case.',
				lte: 'Careful there — most airlines cap checked bags at around 50 lbs (23 kg).',
			},
		},
	},

	// =========================================================================
	// SUITCASE LIMITS
	// =========================================================================
	suitcase: {
		capacity: {
			gte: 10,
			lte: 200,
			decimals: 1,
			messages: {
				number: 'That doesn’t look like a valid number — let’s pop in something measurable for suitcase capacity.',
				positive:
					'A suitcase needs at least a bit of space to be useful — let’s keep it positive.',
				gte: 'That suitcase seems too small to be practical — even carry-ons need a little room.',
				lte: 'That’s a mighty big suitcase! Most travelers would struggle to wheel that through customs.',
			},
		},
		weight: {
			gte: 5,
			lte: 70,
			decimals: 2,
			messages: {
				number: 'Hmm, that weight doesn’t read as a number — try entering it as digits, not words.',
				positive:
					'Suitcase weight should start above zero — even empty luggage has some heft.',
				gte: 'That suitcase weight looks unusually light — check your units, just in case.',
				lte: 'That’s too heavy for most airlines! Try redistributing or using a second case.',
			},
		},
	},

	// =========================================================================
	// ITEM LIMITS
	// =========================================================================
	item: {
		volume: {
			gte: 0.001,
			lte: 1_000,
			decimals: 3,
			messages: {
				number: 'That volume doesn’t look numeric — maybe check for commas or letters that snuck in?',
				positive:
					'Item volume needs to be positive — even the smallest souvenirs take up space.',
				gte: 'That item’s volume seems tiny — maybe double-check the decimal point?',
				lte: 'That volume seems unusually large — are you sure this isn’t a piece of furniture?',
			},
		},
		weight: {
			gte: 0.001,
			lte: 100,
			decimals: 3,
			messages: {
				number: 'That doesn’t seem like a valid weight — use digits so we can measure it properly.',
				positive:
					'Item weight must be positive — nothing weighs *nothing!*',
				gte: 'That seems very light — even a postcard has some weight to it.',
				lte: 'That’s quite heavy for an item — might need its own baggage allowance!',
			},
		},
		quantity: {
			gte: 1,
			lte: 10_000,
			decimals: 0,
			messages: {
				number: 'That doesn’t look like a valid quantity — numbers only, so we can count what’s packed.',
				positive:
					'Quantity must be a positive number — at least one to pack!',
				gte: 'You’ll need at least one of that item — can’t pack zero of something!',
				lte: 'That’s a large number of items! You might want to check if it’s all necessary for the trip.',
			},
		},
	},
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
				});
};
