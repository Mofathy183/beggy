import type { WeightUnit, VolumeUnit } from '../constants/item.enums.js';
import type { BagDTO } from '../types/bag.types.js';
import type { SuitcaseDTO } from '../types/suitcase.types.js';
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
 * Join model linking suitcases to contained items.
 *
 * @remarks
 * - Enables many-to-many relationships
 * - Used for capacity, weight, and packing validation
 */
interface SuitcaseItems {
	item: ItemDTO;
	suitcase: SuitcaseDTO;
}

/**
 * Join model linking bags to contained items.
 *
 * @remarks
 * - Enables many-to-many relationships
 * - Useful for inventory tracking and capacity calculations
 */
interface BagItems {
	item: ItemDTO;
	bag: BagDTO;
}

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
export type ItemsType = (BagItems | SuitcaseItems)[];
