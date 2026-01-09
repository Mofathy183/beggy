import type { NameFieldConfig, NameFieldType, NumberConfigMap } from '@/types';

/**
 * Centralized regular expression constraints used across the Beggy platform.
 *
 * @remarks
 * This object defines **declarative validation patterns only**.
 * It contains no logic and must remain framework-agnostic.
 *
 * These regex patterns are shared between:
 * - API request validation (Zod)
 * - Frontend form validation
 * - Realtime field-level feedback
 *
 * ⚠️ IMPORTANT:
 * - Any change here affects BOTH backend and frontend validation.
 * - Keep patterns permissive but intentional.
 * - Prefer user-friendly validation over overly strict rules.
 *
 * @example
 * ```ts
 * z.string().regex(REGEX.PERSON_NAME)
 * ```
 */
export const REGEX = {
	// 🔴 NAMES
	// ============= PERSON NAMES =============
	/**
	 * PERSON_NAME: /^[\p{L}\s'.-]+$/u
	 * Validates human names with international support
	 * - \p{L}: Any Unicode letter (supports all languages: Arabic, Chinese, French accents, etc.)
	 * - \s: Spaces, tabs, newlines
	 * - '.-: Apostrophes, dots, hyphens (common in names)
	 * - +: Requires at least one character
	 * - /u: Unicode mode (essential for international support)
	 * - Allows: Letters in any language, spaces, apostrophes, dots, hyphens
	 * - Disallows: Numbers, most special characters
	 *
	 * USE: First names, last names
	 * EXAMPLES: "محمد", "José", "O'Connor", "Anne-Marie"
	 */
	PERSON_NAME: /^[\p{L}\s'.-]+$/u,

	// ============= PLACE NAMES =============
	/**
	 * PLACE_NAME: /^[\p{L}\d\s'.,-]+$/u
	 * Validates city/country names with more flexibility than person names
	 * - Allows: Letters, numbers, spaces, apostrophes, commas, dots, hyphens
	 * - Why numbers? Places like "New York 10001", "Rio de Janeiro 2024"
	 * - Why commas? "Washington, D.C.", "São Paulo, SP"
	 *
	 * USE: City names, country names, states, addresses
	 * EXAMPLES: "New York", "São Paulo", "Washington, D.C.", "123 Main St"
	 */
	PLACE_NAME: /^[\p{L}\d\s'.,-]+$/u,

	// ============= PRODUCT NAMES =============
	/**
	 * PRODUCT_NAME: /^[\p{L}\d\s&@#%+!?*().,-]+$/u
	 * Validates product/item names with business-friendly characters
	 * - Allows: Letters, numbers, spaces, & @ # % + ! ? * ( ) . , -
	 * - Why these? Product names often have symbols: "Bag & Case", "Suitcase+", "Jacket (Waterproof)"
	 *
	 * USE: Bag names, suitcase names, item names, product titles
	 * EXAMPLES: "Weekend Backpack", "TravelPro Max+", "Waterproof Jacket (Large)"
	 */
	PRODUCT_NAME: /^[\p{L}\d\s&@#%+!?*().,-]+$/u,

	/**
	 * BRAND_NAME: /^[\p{L}\d\s&.-]+$/u
	 * Validates brand names (more restrictive than product names)
	 * - Allows: Letters, numbers, spaces, & . -
	 * - Disallows: Most special characters except & . -
	 *
	 * USE: Brand names like "Samsonite", "TravelPro", "North Face"
	 * EXAMPLES: "Samsonite", "Osprey Packs", "Tumi & Co.", "Eagle Creek-USA"
	 */
	BRAND_NAME: /^[\p{L}\d\s&.-]+$/u,

	// 🟤 TECHNICAL
	/**
	 * SLUG: /^[a-z0-9]+(?:-[a-z0-9]+)*$/
	 * URL-friendly slugs (no spaces, lowercase)
	 *
	 * USE: URL slugs, identifiers, API endpoints
	 * EXAMPLES: "weekend-backpack", "waterproof-duffel-bag"
	 */
	SLUG: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,

	/**
	 * ALPHANUMERIC: /^[a-zA-Z0-9]+$/
	 * Validates strings containing ONLY English letters and numbers
	 * - a-z: Lowercase letters
	 * - A-Z: Uppercase letters
	 * - 0-9: Numbers
	 * - ^...$: Must match entire string
	 *
	 * USE: Usernames, IDs, product codes, slugs (no spaces/special chars)
	 * EXAMPLES: "User123", "ABC123", "test123"
	 */
	ALPHANUMERIC: /^[a-zA-Z0-9]+$/,

	/**
	 * ALPHANUMERIC_SPACES: /^[a-zA-Z0-9\s]+$/
	 * Validates English letters, numbers, and whitespace
	 * - \s: Any whitespace (space, tab, newline)
	 *
	 * USE: Titles, descriptions, addresses (basic)
	 * EXAMPLES: "Project Alpha 2024", "User Profile 123"
	 */
	ALPHANUMERIC_SPACES: /^[a-zA-Z0-9\s]+$/,

	// 🔵 PASSWORD RULES (Use these individually for real-time feedback)

	/**
	 * PASSWORD_ALLOWED_CHARS: /^[\w!@#$%^&*()\-+=<>?/\\[\]{}|~:;"',.]+$/
	 * Whitelist of allowed password characters
	 * - \w: Word characters (a-z, A-Z, 0-9, _)
	 * - !@#$%^&*()-+=<>?/\\[]{}|~:;"',.: All common special characters
	 * - ^...$: Entire string must match
	 *
	 * USE: Final password validation to ensure no invalid characters
	 */
	PASSWORD_ALLOWED_CHARS: /^[\w!@#$%^&*()\-+=<>?/\\[\]{}|~:;"',.]+$/, // Complete set

	/**
	 * HAS_LOWERCASE: /[a-z]/
	 * Checks if string contains at least one lowercase letter
	 * - [a-z]: Any lowercase English letter
	 * - No ^$ anchors: Can appear anywhere in the string
	 *
	 * USE: Progressive password validation (show what's missing)
	 */
	HAS_LOWERCASE: /[a-z]/,

	/**
	 * HAS_UPPERCASE: /[A-Z]/
	 * Checks if string contains at least one uppercase letter
	 *
	 * USE: Password strength requirement
	 */
	HAS_UPPERCASE: /[A-Z]/,

	/**
	 * HAS_DIGIT: /\d/
	 * Checks if string contains at least one number (0-9)
	 * - \d: Any digit
	 *
	 * USE: Password must contain numbers
	 */
	HAS_DIGIT: /\d/,

	/**
	 * HAS_SPECIAL_CHARACTER: /[!@#$%^&*()\-+=<>?/\\[\]{}|~:;"',.]/
	 * Checks if string contains at least one special character
	 * - Includes 23 common special characters
	 * - Note: Backslash is escaped (\\) in the string
	 *
	 * USE: Password complexity requirement
	 */
	HAS_SPECIAL_CHARACTER: /[!@#$%^&*()\-+=<>?/\\[\]{}|~:;"',.]/,

	/**
	 * NO_SPACES: /^\S*$/
	 * Ensures string contains NO whitespace
	 * - \S: Any non-whitespace character
	 * - *: Zero or more
	 * - ^...$: Entire string must be non-whitespace
	 *
	 * USE: Password cannot contain spaces
	 */
	NO_SPACES: /^\S*$/, // No spaces allowed in passwords

	// 🟣 URLs
	/**
	 * URL_SAFE: /^[a-zA-Z0-9\-._~:/?#[\]@!$&'()*+,;=]+$/
	 * URL-safe characters (RFC 3986)
	 *
	 * USE: URL validation, profile picture URLs
	 */
	URL_SAFE: /^[a-zA-Z0-9\-._~:/?#[\]@!$&'()*+,;=]+$/,

	/**
	 * SIMPLE_URL: /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/
	 * Basic URL validation
	 *
	 * USE: Simple URL checking
	 */
	SIMPLE_URL: /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/,

	// ⚪ Numbers
	// NUMERIC: /^\d+$/,
	// DECIMAL: /^\d+(\.\d{1,2})?$/,
	// PERCENTAGE: /^(100(\.0{1,2})?|[1-9]?\d(\.\d{1,2})?)$/,
} as const;

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
