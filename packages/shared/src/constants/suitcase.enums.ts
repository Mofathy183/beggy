/**
 * High-level suitcase classifications.
 *
 * @remarks
 * - Used for filtering, validation, and airline-related rules
 * - Enum values should remain stable once persisted
 */
export enum SuitcaseType {
	CARRY_ON = 'CARRY_ON',
	CHECKED_LUGGAGE = 'CHECKED_LUGGAGE',
	HARD_SHELL = 'HARD_SHELL',
	SOFT_SHELL = 'SOFT_SHELL',
	BUSINESS = 'BUSINESS',
	KIDS = 'KIDS',
	EXPANDABLE = 'EXPANDABLE',
}

/**
 * Optional functional or structural suitcase features.
 *
 * @remarks
 * - Stored as an array to allow feature composition
 * - `NONE` should be treated as a UX/default state
 */
export enum SuitcaseFeature {
	NONE = 'NONE',
	TSA_LOCK = 'TSA_LOCK',
	WATERPROOF = 'WATERPROOF',
	EXPANDABLE = 'EXPANDABLE',
	USB_PORT = 'USB_PORT',
	LIGHTWEIGHT = 'LIGHTWEIGHT',
	ANTI_THEFT = 'ANTI_THEFT',
	SCRATCH_RESISTANT = 'SCRATCH_RESISTANT',
	COMPRESSION_STRAPS = 'COMPRESSION_STRAPS',
	TELESCOPIC_HANDLE = 'TELESCOPIC_HANDLE',
}

/**
 * Wheel configuration for a suitcase.
 *
 * @remarks
 * - Impacts maneuverability and weight
 * - Nullable to support non-wheeled luggage
 */
export enum WheelType {
	/**
	 * No wheels present
	 */
	NONE = 'NONE',

	/**
	 * Traditional two-wheel design
	 */
	TWO_WHEEL = 'TWO_WHEEL',

	/**
	 * Four-wheel configuration
	 */
	FOUR_WHEEL = 'FOUR_WHEEL',

	/**
	 * 360-degree spinner wheels
	 */
	SPINNER = 'SPINNER',
}

/**
 * Allowed "order by" fields for Suitcase queries.
 *
 * @remarks
 * - Mirrors bag ordering fields where applicable
 * - Keeps sorting rules consistent across container-like entities
 */
export enum SuitcaseOrderByField {
	CREATED_AT = 'createdAt',
	UPDATED_AT = 'updatedAt',
	NAME = 'name',
	MAX_WEIGHT = 'maxWeight',
	MAX_CAPACITY = 'maxCapacity',
}
