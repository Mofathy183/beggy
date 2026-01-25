import type { WeightUnit, VolumeUnit } from '../constants/item.enums.js';
import type {
	ContainerStatusReason,
	ContainerStatus,
} from '../constants/constraints.enums.js';
import type { ItemDTO } from '../types/item.types.js';

/**
 * Lookup map for converting any supported weight unit into kilograms.
 *
 * @remarks
 * - Used internally by `convertToKilogram`
 * - Keys must cover **all** `WeightUnit` enum values
 * - Values represent the **already converted** weight in kilograms
 *
 * @example
 * ```ts
 * const map: ConvertToKilogram = {
 *   KILOGRAM: 5,
 *   GRAM: 0.005,
 *   POUND: 2.26796,
 *   OUNCE: 0.141748,
 * };
 * ```
 */
export type ConvertToKilogram = Record<WeightUnit, number>;

/**
 * Lookup map for converting any supported volume unit into liters.
 *
 * @remarks
 * - Used internally by `convertToLiter`
 * - Ensures all `VolumeUnit` values are handled explicitly
 * - Centralizes unit normalization logic
 *
 * @example
 * ```ts
 * const map: ConvertToLiter = {
 *   LITER: 3.5,
 *   ML: 0.0035,
 *   CU_CM: 0.0035,
 *   CU_IN: 0.057,
 * };
 * ```
 */
export type ConvertToLiter = Record<VolumeUnit, number>;

/**
 * Union type representing item collections inside containers.
 *
 * @remarks
 * - Used by shared calculation utilities (weight, capacity, count)
 * - Requires a common shape: `{ item: { weight, volume, quantity, ... } }`
 * - Keeps helper functions container-agnostic
 *
 * @example
 * ```ts
 * calculateCurrentWeight(bag.bagItems);
 * calculateCurrentCapacity(suitcase.suitcaseItems);
 * ```
 */
export interface ContainerItem {
	quantity: number;
	item: Pick<ItemDTO, 'volume' | 'weight' | 'weightUnit' | 'volumeUnit'>;
}

/**
 * Derived container state with both high-level status
 * and low-level explanatory reasons.
 */
export interface ContainerStatusResult {
	status: ContainerStatus;
	reasons: ContainerStatusReason[];
}

/**
 * Factual container state derived from calculation functions.
 *
 * This structure MUST be built from calculation outputs,
 * not recomputed inside the status layer.
 */
export interface ContainerStatusParams {
	isOverweight: boolean;
	isOverCapacity: boolean;
	isWeightNearLimit: boolean;
	isCapacityNearLimit: boolean;
	itemCount: number; // will be the quantity that in the ContainerItems
}

/**
 * Derived container metrics shared by all container types.
 *
 * @remarks
 * - Computed at runtime from items + constraints
 * - Never persisted
 * - UI-facing, read-only data
 */
export interface ContainerMetrics {
	/**
	 * Computed bag metrics.
	 *
	 * @remarks
	 * - Derived from contained items and bag constraints
	 * - Never persisted directly in the database
	 */
	currentWeight: number;
	currentCapacity: number;
	remainingWeight: number;
	remainingCapacity: number;

	/**
	 * Utilization percentages.
	 *
	 * @remarks
	 * - Values range from 0 to 100
	 * - Used for progress indicators and summaries
	 */
	weightPercentage: number;
	capacityPercentage: number;

	/**
	 * Number of items currently contained in the bag.
	 */
	itemCount: number;
}

export interface ContainerState {
	/**
	 * Constraint state flags.
	 *
	 * @remarks
	 * - Provide quick insight into constraint violations
	 * - Useful for UI indicators and validation feedback
	 */
	isOverweight: boolean;
	isOverCapacity: boolean;
	isFull: boolean;

	/**
	 * Derived bag status.
	 *
	 * @remarks
	 * Computed from capacity and weight constraints.
	 */
	status: ContainerStatus;
	reasons: ContainerStatusReason[];
}

export interface ContainerStatusDTO {
	metrics: ContainerMetrics;
	state: ContainerState;
}
