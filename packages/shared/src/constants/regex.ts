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
