import type { ConvertToKilogram, ConvertToLiter, ItemsType } from '@/types';
import { WeightUnit, VolumeUnit } from '@/types';

//* ============================================================================
//* SHARED CALCULATION FUNCTIONS
//* ============================================================================

/**
 * Converts any weight unit to kilograms (standard unit)
 *
 * @param {number} weight - Weight value to convert
 * @param {WeightUnit} unit - Current unit of the weight
 * @returns {number} Weight in kilograms
 *
 * @example
 * convertToKilogram(1000, 'GRAM'); // Returns 1
 * convertToKilogram(2.2, 'POUND'); // Returns 0.997903
 */
export const convertToKilogram = (weight: number, unit: WeightUnit): number => {
	const convert: ConvertToKilogram = {
		KILOGRAM: weight,
		GRAM: weight / 1000, // 1000g = 1kg,
		POUND: weight * 0.453592, // 1 pound = 0.453592 kg
		OUNCE: weight * 0.0283495, // 1 ounce = 0.0283495 kg
	};

	return convert[unit];
};

/**
 * Converts any volume unit to liters (standard unit)
 *
 * @param {number} volume - Volume value to convert
 * @param {VolumeUnit} unit - Current unit of the volume
 * @returns {number} Volume in liters
 *
 * @example
 * convertToLiter(1000, 'ML'); // Returns 1
 * convertToLiter(1000, 'CU_CM'); // Returns 1
 */
export const convertToLiter = (volume: number, unit: VolumeUnit): number => {
	const convert: ConvertToLiter = {
		LITER: volume,
		ML: volume / 1000, // 1000ml = 1L
		CU_CM: volume / 1000, // 1000 cm³ = 1L
		CU_IN: volume * 0.0163871, // 1 cubic inch = 0.0163871L
	};

	return convert[unit];
};

// ============================================================================
// WEIGHT CALCULATION FUNCTIONS
// ============================================================================

/**
 * Calculates the current total weight of items in a bag or suitcase
 * Converts all weights to kilograms before summing
 *
 * @param {ItemsType} items - Array of BagItems or SuitcaseItems with nested item data
 * @returns {number} Current weight in kilograms, rounded to 2 decimal places
 *
 * @example
 * const items = [
 *   { item: { weight: 2500, weightUnit: 'GRAM', quantity: 3 } }, // 7.5 kg
 *   { item: { weight: 2.2, weightUnit: 'POUND', quantity: 2 } }  // ~2.0 kg
 * ];
 * calculateCurrentWeight(items); // Returns ~9.5
 */
export const calculateCurrentWeight = (items: ItemsType): number => {
	// Return 0 if no items exist
	if (!items || items.length === 0) return 0;

	// Sum up: (item weight in kg × item quantity) for each item
	const currentWeight = items.reduce((accumulator, current) => {
		const item = current.item;

		// Convert weight to kilograms
		const weightInKg = convertToKilogram(item.weight, item.weightUnit);

		return accumulator + weightInKg * item.quantity;
	}, 0);

	// Round to 2 decimal places and convert to number
	return Number(parseFloat(currentWeight.toFixed(2)));
};

/**
 * Calculates the total weight including the container's own weight
 * This is useful for checking airline baggage limits, where empty bag weight counts
 *
 * @param {ItemsType} items - Array of BagItems or SuitcaseItems with nested item data
 * @param {number} containerWeight - Weight of the empty bag/suitcase in kg
 * @returns {number} Total weight (items + container) in kilograms
 *
 * @example
 * const items = [{ item: { weight: 10, weightUnit: 'KILOGRAM', quantity: 1 } }];
 * calculateTotalWeightWithContainer(items, 2.5); // Returns 12.5 (10kg items + 2.5kg bag)
 */
export const calculateTotalWeightWithContainer = (
	items: ItemsType,
	containerWeight: number
): number => {
	const itemsWeight = calculateCurrentWeight(items);
	const totalWeight = itemsWeight + containerWeight;

	return Number(parseFloat(totalWeight.toFixed(2)));
};

// ============================================================================
// CAPACITY/VOLUME CALCULATION FUNCTIONS
// ============================================================================

/**
 * Calculates the current volume/capacity used by items in a bag or suitcase
 * Converts all volumes to liters before summing
 *
 * @param {ItemsType} items - Array of BagItems or SuitcaseItems with nested item data
 * @returns {number} Current volume in liters, rounded to 2 decimal places
 *
 * @example
 * const items = [
 *   { item: { volume: 5000, volumeUnit: 'ML', quantity: 2 } },  // 10.0 liters
 *   { item: { volume: 3.5, volumeUnit: 'LITER', quantity: 1 } } // 3.5 liters
 * ];
 * calculateCurrentCapacity(items); // Returns 13.5
 */
export const calculateCurrentCapacity = (items: ItemsType): number => {
	// Return 0 if no items exist
	if (!items || items.length === 0) return 0;

	// Sum up: (item volume in liters × item quantity) for each item
	const currentCapacity = items.reduce((accumulator, bagItem) => {
		const item = bagItem.item;

		// Convert volume to liters
		const volumeInLiters = convertToLiter(item.volume, item.volumeUnit);

		return accumulator + volumeInLiters * item.quantity;
	}, 0);

	// Round to 2 decimal places and convert to number
	return Number(parseFloat(currentCapacity.toFixed(2)));
};

// ============================================================================
// REMAINING CAPACITY FUNCTIONS
// ============================================================================

/**
 * Calculates how much weight capacity is remaining
 *
 * @param {number} currentWeight - Current weight of items in kg
 * @param {number} maxWeight - Maximum weight capacity in kg
 * @returns {number} Remaining weight capacity in kg (never negative)
 *
 * @example
 * calculateRemainingWeight(15.5, 20.0); // Returns 4.5
 * calculateRemainingWeight(25.0, 20.0); // Returns 0 (overweight, but never negative)
 */
export const calculateRemainingWeight = (
	currentWeight: number,
	maxWeight: number
): number => {
	// If no max weight is set, return 0
	if (!maxWeight || maxWeight <= 0) return 0;

	// Calculate remaining capacity, but never return negative values
	// If bag is overweight, return 0 instead of negative number
	return Math.max(0, Number((maxWeight - currentWeight).toFixed(2)));
};

/**
 * Calculates how much volume capacity is remaining
 *
 * @param {number} currentCapacity - Current volume used in liters
 * @param {number} maxCapacity - Maximum volume capacity in liters
 * @returns {number} Remaining volume capacity in liters (never negative)
 *
 * @example
 * calculateRemainingCapacity(35.5, 50.0); // Returns 14.5
 * calculateRemainingCapacity(55.0, 50.0); // Returns 0 (over capacity)
 */
export const calculateRemainingCapacity = (
	currentCapacity: number,
	maxCapacity: number
): number => {
	// If no max capacity is set, return 0
	if (!maxCapacity || maxCapacity <= 0) return 0;

	// Calculate remaining capacity, but never return negative values
	return Math.max(0, Number((maxCapacity - currentCapacity).toFixed(2)));
};

// ============================================================================
// ITEM COUNT FUNCTION
// ============================================================================

/**
 * Counts the total number of individual items (considering quantities)
 *
 * @param {ItemsType} items - Array of BagItems or SuitcaseItems with nested item data
 * @returns {number} Total count of all items
 *
 * @example
 * const items = [
 *   { item: { quantity: 3 } }, // 3 shirts
 *   { item: { quantity: 2 } }, // 2 pants
 *   { item: { quantity: 1 } }  // 1 jacket
 * ];
 * calculateItemCount(items); // Returns 6
 */
export const calculateItemCount = (items: ItemsType): number => {
	// Return 0 if no items exist
	if (!items || items.length === 0) return 0;

	// Sum up the quantity of each item
	return items.reduce((accumulator, bagItem) => {
		return accumulator + bagItem.item.quantity;
	}, 0);
};

// ============================================================================
// PERCENTAGE CALCULATION FUNCTIONS
// ============================================================================

/**
 * Calculates weight percentage (utilization rate)
 * Shows how much of the maximum weight is being used
 *
 * @param {number} currentWeight - Current weight in kg
 * @param {number} maxWeight - Maximum weight capacity in kg
 * @returns {number} Percentage of weight capacity used (0-100+), as integer
 *
 * @example
 * calculateWeightPercentage(15.0, 20.0); // Returns 75
 * calculateWeightPercentage(22.0, 20.0); // Returns 110 (over capacity)
 * calculateWeightPercentage(5.5, 20.0);  // Returns 27.5
 */
export const calculateWeightPercentage = (
	currentWeight: number,
	maxWeight: number
): number => {
	// If no max weight, return 0
	if (!maxWeight || maxWeight <= 0) return 0;

	// If no current weight, return 0
	if (!currentWeight || currentWeight < 0) return 0;

	// Calculate percentage and round to 1 decimal place
	return Number(((currentWeight / maxWeight) * 100).toFixed(1));
};

/**
 * Calculates capacity percentage (utilization rate)
 * Shows how much of the maximum volume is being used
 *
 * @param {number} currentCapacity - Current volume in liters
 * @param {number} maxCapacity - Maximum volume capacity in liters
 * @returns {number} Percentage of volume capacity used (0-100+), as integer
 *
 * @example
 * calculateCapacityPercentage(40.0, 50.0); // Returns 80
 * calculateCapacityPercentage(55.0, 50.0); // Returns 110 (over capacity)
 * calculateCapacityPercentage(12.5, 50.0); // Returns 25
 */
export const calculateCapacityPercentage = (
	currentCapacity: number,
	maxCapacity: number
): number => {
	// If no max capacity, return 0
	if (!maxCapacity || maxCapacity <= 0) return 0;

	// If no current capacity, return 0
	if (!currentCapacity || currentCapacity < 0) return 0;

	// Calculate percentage and round to 1 decimal place
	return Number(((currentCapacity / maxCapacity) * 100).toFixed(1));
};

// ============================================================================
// HELPER FUNCTION FOR DISPLAY
// ============================================================================
