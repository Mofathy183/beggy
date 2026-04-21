/**
 * Derived status representing the current state of a container
 * (bag or suitcase) based on weight and capacity calculations.
 *
 * @remarks
 * - Intended for **UI display**, warnings, and validation feedback
 * - Should be computed, not stored in persistence
 * - Priority rules (recommended):
 *   1. OVERWEIGHT / OVER_CAPACITY
 *   2. FULL
 *   3. EMPTY
 *   4. OK
 */
export enum ContainerStatus {
	/**
	 * Container is within safe weight and capacity limits
	 */
	OK = 'ok',

	/**
	 * Container has reached its capacity limit
	 * but is not yet over capacity
	 */
	FULL = 'full',

	/**
	 * Container contains no items
	 */
	EMPTY = 'empty',

	/**
	 * Container exceeds its maximum weight limit
	 */
	OVERWEIGHT = 'overweight',

	/**
	 * Container exceeds its maximum volume/capacity limit
	 */
	OVER_CAPACITY = 'over_capacity',
}

/**
 * Explains why a container is in its current computed state.
 *
 * @remarks
 * - Reasons are derived from container metrics (weight, capacity)
 * - Multiple reasons can apply simultaneously
 * - Designed for UI consumption (warnings, hints, validation feedback)
 *
 * These values are part of the read model and should remain stable,
 * as they may be consumed directly by frontend logic.
 */
export enum ContainerStatusReason {
	/** Total weight exceeds the allowed maximum */
	WEIGHT_OVER_LIMIT = 'weight_over_limit',

	/** Total weight is approaching the allowed maximum threshold */
	WEIGHT_NEAR_LIMIT = 'weight_near_limit',

	/** Item count exceeds container capacity */
	CAPACITY_OVER_LIMIT = 'capacity_over_limit',

	/** Item count is approaching container capacity */
	CAPACITY_NEAR_LIMIT = 'capacity_near_limit',

	/** Container has no items */
	EMPTY = 'empty',
}

/**
 * Supported container types within the packing domain.
 *
 * @remarks
 * Represents a closed set of container categories used across:
 * - Persistence layer (Prisma)
 * - Business logic (constraints, rules)
 * - UI representation
 *
 * Any addition here should be reflected consistently across all layers.
 */
export enum ContainerType {
	BAG = 'BAG',
	SUITCASE = 'SUITCASE',
}
