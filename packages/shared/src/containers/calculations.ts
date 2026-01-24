import type {
	ConvertToKilogram,
	ConvertToLiter,
	ContainerItem,
    ContainerMetrics,
} from '../types/constraints.types.js';
import { type WeightUnit, type VolumeUnit } from '../constants/item.enums.js';

//* ============================================================================
//* SHARED CALCULATION FUNCTIONS
//* ============================================================================

/**
 * Converts a weight value from its original unit into kilograms.
 *
 * Kilograms are treated as the system-wide canonical unit
 * for all weight calculations inside containers.
 *
 * @param weight - Raw weight value
 * @param unit - Unit of the provided weight
 * @returns Weight expressed in kilograms
 *
 * @remarks
 * - This function is pure and side-effect free
 * - Always returns a numeric value to keep downstream
 *   calculations deterministic
 * - If the provided unit is unsupported, the value is
 *   treated as already being in kilograms
 *
 * @example
 * convertToKilogram(1000, 'GRAM');  // 1
 * convertToKilogram(2.2, 'POUND');  // ~0.9979
 */
export const convertToKilogram = (weight: number, unit: WeightUnit): number => {
	const convert: ConvertToKilogram = {
		KILOGRAM: weight,
		GRAM: weight / 1000, // 1000g = 1kg,
		POUND: weight * 0.453592, // 1 pound = 0.453592 kg
		OUNCE: weight * 0.0283495, // 1 ounce = 0.0283495 kg
	};

	return convert[unit] ?? convert.KILOGRAM;
};

/**
 * Converts a volume value from its original unit into liters.
 *
 * Liters are treated as the system-wide canonical unit
 * for all capacity calculations inside containers.
 *
 * @param volume - Raw volume value
 * @param unit - Unit of the provided volume
 * @returns Volume expressed in liters
 *
 * @remarks
 * - Always returns a numeric value to simplify aggregation logic
 * - If the provided unit is unsupported, the value is
 *   treated as already being in liters
 *
 * @example
 * convertToLiter(1000, 'ML');    // 1
 * convertToLiter(1000, 'CU_CM'); // 1
 */
export const convertToLiter = (volume: number, unit: VolumeUnit): number => {
	const convert: ConvertToLiter = {
		LITER: volume,
		ML: volume / 1000, // 1000ml = 1L
		CU_CM: volume / 1000, // 1000 cm³ = 1L
		CU_IN: volume * 0.0163871, // 1 cubic inch = 0.0163871L
	};

	return convert[unit] ?? convert.LITER;
};

// ============================================================================
// WEIGHT CALCULATION FUNCTIONS
// ============================================================================

/**
 * Calculates the total weight of all items currently packed
 * inside a container (excluding the container itself).
 *
 * All item weights are normalized to kilograms before aggregation.
 *
 * @param items - Packed container items with quantity and item metadata
 * @returns Total item weight in kilograms (rounded to 2 decimals)
 *
 * @remarks
 * - Safe for empty containers
 * - Relies on unit converters that always return numbers
 * - Rounding is applied once at the aggregate level
 *
 * @example
 * calculateCurrentWeight(items); // 9.5
 */
export const calculateCurrentWeight = (items: ContainerItem[]): number => {
	// No items means no weight
	if (!items || items.length === 0) return 0;

	const currentWeight = items.reduce((accumulator, containerItem) => {
		const { weight, weightUnit } = containerItem.item;

		// Normalize item weight into kilograms
		const weightInKg = convertToKilogram(weight, weightUnit);

		// Defensive fallback for unsupported units
		return accumulator + weightInKg * containerItem.quantity;
	}, 0);

	// Round final aggregated weight
	return Number(currentWeight.toFixed(2));
};

/**
 * Calculates the total carried weight including the empty container.
 *
 * This is the value typically used for airline or transport limits.
 *
 * @param items - Packed container items
 * @param containerWeight - Empty container weight in kilograms
 * @returns Total carried weight in kilograms (rounded to 2 decimals)
 *
 * @remarks
 * - Gracefully handles missing item weight data
 * - Container weight is assumed to already be in kilograms
 */
export const calculateTotalWeightWithContainer = (
	items: ContainerItem[],
	containerWeight: number
): number => {
	const itemsWeight = calculateCurrentWeight(items);

	// If itemsWeight is undefined, treat it as 0 for total calculation
	const safeItemsWeight = typeof itemsWeight === 'number' ? itemsWeight : 0;

	return Number((safeItemsWeight + containerWeight).toFixed(2));
};

// ============================================================================
// CAPACITY/VOLUME CALCULATION FUNCTIONS
// ============================================================================

/**
 * Calculates the total volume currently occupied inside a container.
 *
 * All item volumes are normalized to liters before aggregation.
 *
 * @param items - Packed container items with quantity and item metadata
 * @returns Total used volume in liters (rounded to 2 decimals)
 *
 * @remarks
 * - Invalid or unsupported volume units are ignored safely
 * - Rounding happens after aggregation
 */
export const calculateCurrentCapacity = (items: ContainerItem[]): number => {
	if (!items || items.length === 0) return 0;

	const currentCapacity = items.reduce((accumulator, containerItem) => {
		const { volume, volumeUnit } = containerItem.item;

		const volumeInLiters = convertToLiter(volume, volumeUnit);

		// If conversion fails (undefined or null), treat volume as 0
		const safeVolume =
			typeof volumeInLiters === 'number' && !Number.isNaN(volumeInLiters)
				? volumeInLiters
				: 0;

		return accumulator + safeVolume * containerItem.quantity;
	}, 0);

	// Round to 2 decimal places and convert to number
	return Number(currentCapacity.toFixed(2));
};

// ============================================================================
// REMAINING CAPACITY FUNCTIONS
// ============================================================================

/**
 * Calculates remaining allowable weight capacity.
 *
 * Never returns negative values; overweight containers return 0.
 *
 * @param currentWeight - Current total weight in kilograms
 * @param maxWeight - Maximum allowed weight in kilograms
 * @returns Remaining weight capacity in kilograms
 */
export const calculateRemainingWeight = (
	currentWeight: number,
	maxWeight: number
): number => {
	if (!maxWeight || maxWeight <= 0) return 0;

	// Calculate remaining capacity, but never return negative values
	// If bag is overweight, return 0 instead of negative number
	return Math.max(0, Number((maxWeight - currentWeight).toFixed(2)));
};

/**
 * Calculates remaining usable volume capacity.
 *
 * Never returns negative values; overfilled containers return 0.
 *
 * @param currentCapacity - Used volume in liters
 * @param maxCapacity - Maximum container capacity in liters
 * @returns Remaining volume capacity in liters
 */
export const calculateRemainingCapacity = (
	currentCapacity: number,
	maxCapacity: number
): number => {
	if (!maxCapacity || maxCapacity <= 0) return 0;

	// Calculate remaining capacity, but never return negative values
	return Math.max(0, Number((maxCapacity - currentCapacity).toFixed(2)));
};

// ============================================================================
// PERCENTAGE CALCULATION FUNCTIONS
// ============================================================================

/**
 * Calculates weight utilization percentage relative to max weight.
 *
 * Values may exceed 100% if container is overweight.
 *
 * @param currentWeight - Current weight in kilograms
 * @param maxWeight - Maximum allowed weight in kilograms
 * @returns Weight usage percentage (rounded to 1 decimal)
 */
export const calculateWeightPercentage = (
	currentWeight: number,
	maxWeight: number
): number => {
	if (!maxWeight || maxWeight <= 0) return 0; //? no max weight
	if (!currentWeight || currentWeight < 0) return 0; //? no current weight

	// Calculate percentage and round to 1 decimal place
	return Number(((currentWeight / maxWeight) * 100).toFixed(1));
};

/**
 * Calculates volume utilization percentage relative to max capacity.
 *
 * Values may exceed 100% if container is overfilled.
 *
 * @param currentCapacity - Used volume in liters
 * @param maxCapacity - Maximum volume capacity in liters
 * @returns Volume usage percentage (rounded to 1 decimal)
 */
export const calculateCapacityPercentage = (
	currentCapacity: number,
	maxCapacity: number
): number => {
	if (!maxCapacity || maxCapacity <= 0) return 0; //? no max capacity
	if (!currentCapacity || currentCapacity < 0) return 0; //? no current capacity

	// Calculate percentage and round to 1 decimal place
	return Number(((currentCapacity / maxCapacity) * 100).toFixed(1));
};


/**
 * Computes derived container metrics based on its items and constraints.
 *
 * @remarks
 * - All values returned here are calculated at runtime.
 * - No field produced by this function should be persisted.
 * - The output is designed for UI consumption (progress bars, limits, summaries).
 *
 * @param params.items - Items currently placed inside the container.
 * @param params.containerWeight - The empty container's own weight.
 * @param params.maxWeight - Maximum allowed total weight.
 * @param params.maxCapacity - Maximum allowed capacity.
 *
 * @returns A snapshot of calculated container metrics.
 */
export const buildContainerMetrics = (params: {
	items: ContainerItem[];
	containerWeight: number;
	maxWeight: number;
	maxCapacity: number;
}): ContainerMetrics => {
	// Aggregate capacity derived from all contained items.
	const currentCapacity = calculateCurrentCapacity(params.items);

	// Total carried weight including both items and the container itself.
	const currentWeight = calculateTotalWeightWithContainer(
		params.items,
		params.containerWeight
	);

	return {
		// Absolute usage values
		currentWeight,
		currentCapacity,

		// Remaining available space before limits are reached
		remainingWeight: calculateRemainingWeight(
			currentWeight,
			params.maxWeight
		),
		remainingCapacity: calculateRemainingCapacity(
			currentCapacity,
			params.maxCapacity
		),

		// Utilization percentages used for UI indicators and warnings
		weightPercentage: calculateWeightPercentage(
			currentWeight,
			params.maxWeight
		),
		capacityPercentage: calculateCapacityPercentage(
			currentCapacity,
			params.maxCapacity
		),

		// Simple count of contained items (used for summaries and status logic)
		itemCount: params.items.length,
	};
};
