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
