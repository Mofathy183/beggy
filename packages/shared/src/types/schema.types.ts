/**
 * Domain identifier for human-readable name fields.
 *
 * Used to select:
 * - Validation regex
 * - Length constraints
 * - Error message tone
 *
 * This keeps name validation *semantic*, not just string-based.
 *
 * @example
 * FieldsSchema.name("First Name", "person")
 * FieldsSchema.name("Brand", "brand")
 */
export type NameFieldType = 'person' | 'product' | 'brand' | 'place';

/**
 * Message factory contract for name field validation.
 *
 * Each function receives the field's display name
 * (e.g. "First Name") and returns a contextual message.
 *
 * This allows:
 * - Reusable validation logic
 * - Friendly, domain-aware error messages
 * - Zero hard-coded strings inside schemas
 */
export type NameFieldMessages = {
	minLength: (firstName: string) => string;
	maxLength: (firstName: string) => string;
	regex: (firstName: string) => string;
};

/**
 * Configuration contract for a name field domain.
 *
 * Used internally by `createNameField()` to build
 * a complete Zod schema with:
 * - Regex validation
 * - Length constraints
 * - Consistent error messaging
 *
 * Each `NameFieldType` maps to one config object.
 */
export type NameFieldConfig = {
	/** Regex pattern enforcing allowed characters */
	regex: RegExp;

	/** Default maximum length for the name */
	defaultMaxLength: number;

	/** Default minimum length for the name */
	defaultMinLength: number;

	/** Domain-specific error message generators */
	messages: NameFieldMessages;
};

/**
 * Internal map of numeric domains and their valid metrics.
 *
 * This type ensures:
 * - Only valid metric combinations are allowed
 * - Compile-time safety when creating numeric fields
 *
 * ⚠️ Not exported directly — used for type derivation only.
 */
type NumericDomains = {
	bag: 'weight' | 'capacity';
	suitcase: 'weight' | 'capacity';
	item: 'weight' | 'volume' | 'quantity';
};

/**
 * High-level numeric entity identifier.
 *
 * Represents *what* is being measured
 * (e.g. bag, suitcase, item).
 *
 * Used by `FieldsSchema.number()`.
 */
export type NumericEntity = keyof NumericDomains;

/**
 * Metric type derived from the numeric entity.
 *
 * This enforces correct metric usage:
 * - `bag` → weight | capacity
 * - `item` → weight | volume | quantity
 *
 * @example
 * NumericMetric<'bag'> // "weight" | "capacity"
 */
export type NumericMetric<E extends keyof NumericDomains> = NumericDomains[E];

/**
 * Configuration contract for numeric field validation.
 *
 * Used by `createNumberField()` to generate
 * consistent numeric schemas with:
 * - Min/max constraints
 * - Decimal precision
 * - Friendly error messages
 */
export type NumberFieldConfig = {
	/** Minimum allowed value (alias for z.min) */
	gte: number;

	/** Maximum allowed value (alias for z.max) */
	lte: number;

	/** Allowed decimal precision */
	decimals: number;

	/** Error messages for numeric validation */
	messages: {
		gte: string;
		lte: string;
		positive: string;
		number: string;
	};
};

/**
 * Complete numeric configuration map.
 *
 * Maps:
 * - Entity → Metric → Validation rules
 *
 * This enables:
 * - Centralized numeric constraints
 * - Compile-time safe configuration
 * - Zero magic numbers in schemas
 *
 * @example
 * NUMBER_CONFIG.bag.weight
 * NUMBER_CONFIG.item.quantity
 */
export type NumberConfigMap = {
	[E in NumericEntity]: {
		[M in NumericMetric<E>]: NumberFieldConfig;
	};
};
