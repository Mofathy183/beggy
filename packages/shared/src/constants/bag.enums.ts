/**
 * Supported bag categories.
 *
 * @remarks
 * - Used for filtering, validation, and UX grouping
 * - Should remain stable once persisted (enum changes are breaking)
 */
export enum BagType {
	BACKPACK = 'BACKPACK',
	DUFFEL = 'DUFFEL',
	TOTE = 'TOTE',
	MESSENGER = 'MESSENGER',
	LAPTOP_BAG = 'LAPTOP_BAG',
	TRAVEL_BAG = 'TRAVEL_BAG',
	HANDBAG = 'HANDBAG',
	CROSSBODY = 'CROSSBODY',
	SHOULDER_BAG = 'SHOULDER_BAG',
}

/**
 * Physical size classification for bags.
 *
 * @remarks
 * - Abstracts away exact dimensions
 * - Useful for UI labels and basic constraints
 */
export enum Size {
	SMALL = 'SMALL',
	MEDIUM = 'MEDIUM',
	LARGE = 'LARGE',
	EXTRA_LARGE = 'EXTRA_LARGE',
}

/**
 * Primary material used in bag construction.
 *
 * @remarks
 * - Used for durability, weight, and care instructions
 * - Nullable to support legacy or unknown materials
 */
export enum Material {
	LEATHER = 'LEATHER',
	SYNTHETIC = 'SYNTHETIC',
	FABRIC = 'FABRIC',
	POLYESTER = 'POLYESTER',
	NYLON = 'NYLON',
	CANVAS = 'CANVAS',
	HARD_SHELL = 'HARD_SHELL',
	METAL = 'METAL',
}

/**
 * Optional functional or structural features of a bag.
 *
 * @remarks
 * - Stored as an array to allow composition
 * - `NONE` should be treated as a UX/default state, not combined with others
 */
export enum BagFeature {
	NONE = 'NONE',
	WATERPROOF = 'WATERPROOF',
	PADDED_LAPTOP_COMPARTMENT = 'PADDED_LAPTOP_COMPARTMENT',
	USB_PORT = 'USB_PORT',
	ANTI_THEFT = 'ANTI_THEFT',
	MULTIPLE_POCKETS = 'MULTIPLE_POCKETS',
	LIGHTWEIGHT = 'LIGHTWEIGHT',
	EXPANDABLE = 'EXPANDABLE',
	REINFORCED_STRAPS = 'REINFORCED_STRAPS',
	TROLLEY_SLEEVE = 'TROLLEY_SLEEVE',
	HIDDEN_POCKET = 'HIDDEN_POCKET',
}

/**
 * Allowed "order by" fields for Bag queries.
 *
 * @remarks
 * - Restricts sorting to safe, indexed, and publicly exposed fields
 * - Used by order-by schema factory to prevent arbitrary column access
 * - Values map directly to API / database field names
 */
export enum BagOrderByField {
	CREATED_AT = 'createdAt',
	UPDATED_AT = 'updatedAt',
	NAME = 'name',
	MAX_WEIGHT = 'maxWeight',
	MAX_CAPACITY = 'maxCapacity',
}
