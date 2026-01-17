/**
 * High-level classification for items.
 *
 * @remarks
 * - Used for filtering, grouping, and UX affordance
 * - Categories should remain stable once persisted
 */
export enum ItemCategory {
	ELECTRONICS = 'ELECTRONICS',
	ACCESSORIES = 'ACCESSORIES',
	FURNITURE = 'FURNITURE',
	MEDICINE = 'MEDICINE',
	CLOTHING = 'CLOTHING',
	BOOKS = 'BOOKS',
	FOOD = 'FOOD',
}

/**
 * Supported volume measurement units.
 *
 * @remarks
 * - Enables accurate capacity calculations
 * - Conversions should happen in domain services, not models
 */
export enum VolumeUnit {
	/**
	 * Milliliters
	 */
	ML = 'ML',

	/**
	 * Liters
	 */
	LITER = 'LITER',

	/**
	 * Cubic centimeters
	 */
	CU_CM = 'CU_CM',

	/**
	 * Cubic inches
	 */
	CU_IN = 'CU_IN',
}

/**
 * Supported weight measurement units.
 *
 * @remarks
 * - Used for transport and capacity constraints
 * - Keep units explicit to avoid implicit assumptions
 */
export enum WeightUnit {
	/**
	 * Grams
	 */
	GRAM = 'GRAM',

	/**
	 * Kilograms
	 */
	KILOGRAM = 'KILOGRAM',

	/**
	 * Pounds
	 */
	POUND = 'POUND',

	/**
	 * Ounces
	 */
	OUNCE = 'OUNCE',
}

/**
 * Allowed "order by" fields for Item queries.
 *
 * @remarks
 * - Ensures items can only be sorted by explicitly approved fields
 * - Prevents accidental sorting on unindexed or sensitive columns
 */
export enum ItemOrderByField {
	CREATED_AT = 'createdAt',
	UPDATED_AT = 'updatedAt',
	NAME = 'name',
	WEIGHT = 'weight',
	VOLUME = 'volume',
}
