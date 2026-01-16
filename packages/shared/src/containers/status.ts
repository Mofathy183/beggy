import { ContainerStatus } from '../types/constraints.types.js';

// ============================================================================
// STATUS CHECK FUNCTIONS
// ============================================================================

/**
 * Checks if current weight exceeds the maximum allowed weight
 *
 * @param {number} currentWeight - Current weight of items in kg
 * @param {number} maxWeight - Maximum weight capacity in kg
 * @returns {boolean} True if overweight, false otherwise
 *
 * @example
 * checkIsOverweight(22.5, 20.0); // Returns true (exceeded by 2.5)
 * checkIsOverweight(18.0, 20.0); // Returns false (within limit)
 * checkIsOverweight(0, 20.0);    // Returns false (empty bag)
 */
export const checkIsOverweight = (
	currentWeight: number,
	maxWeight: number
): boolean => {
	// If no max weight is set, can't be overweight
	if (!maxWeight || maxWeight <= 0) return false;

	// If current weight is 0 or negative, not overweight
	if (!currentWeight || currentWeight <= 0) return false;

	// Check if current weight exceeds maximum
	return currentWeight > maxWeight;
};

/**
 * Checks if current capacity/volume exceeds the maximum allowed capacity
 *
 * @param {number} currentCapacity - Current volume used in liters
 * @param {number} maxCapacity - Maximum volume capacity in liters
 * @returns {boolean} True if over capacity, false otherwise
 *
 * @example
 * checkIsOverCapacity(55.0, 50.0); // Returns true (exceeded by 5.0)
 * checkIsOverCapacity(45.0, 50.0); // Returns false (within limit)
 */
export const checkIsOverCapacity = (
	currentCapacity: number,
	maxCapacity: number
): boolean => {
	// If no max capacity is set, can't be over capacity
	if (!maxCapacity || maxCapacity <= 0) return false;

	// If current capacity is 0 or negative, not over capacity
	if (!currentCapacity || currentCapacity <= 0) return false;

	// Check if current capacity exceeds maximum
	return currentCapacity > maxCapacity;
};

/**
 * Determines if a bag/suitcase is considered "full"
 * A container is full if EITHER weight OR capacity is at/above 95% of maximum
 *
 * @param {number} currentWeight - Current weight in kg
 * @param {number} maxWeight - Maximum weight capacity in kg
 * @param {number} currentCapacity - Current volume in liters
 * @param {number} maxCapacity - Maximum volume capacity in liters
 * @returns {boolean} True if full (>=95% on weight OR capacity), false otherwise
 *
 * @example
 * checkIsFull(19.0, 20.0, 45.0, 50.0); // Returns true (95% weight)
 * checkIsFull(15.0, 20.0, 48.0, 50.0); // Returns true (96% capacity)
 * checkIsFull(10.0, 20.0, 30.0, 50.0); // Returns false (50% weight, 60% capacity)
 */
export const checkIsFull = (
	currentWeight: number,
	maxWeight: number,
	currentCapacity: number,
	maxCapacity: number
): boolean => {
	// Define threshold for "full" (95%)
	const FULL_THRESHOLD = 0.95;

	// Check weight utilization
	let isWeightFull = false;
	if (maxWeight && maxWeight > 0) {
		const weightUtilization = currentWeight / maxWeight;
		isWeightFull = weightUtilization >= FULL_THRESHOLD;
	}

	// Check capacity utilization
	let isCapacityFull = false;
	if (maxCapacity && maxCapacity > 0) {
		const capacityUtilization = currentCapacity / maxCapacity;
		isCapacityFull = capacityUtilization >= FULL_THRESHOLD;
	}

	// Container is full if EITHER weight OR capacity is at/above threshold
	return isWeightFull || isCapacityFull;
};

/**
 * Gets a human-readable status for a bag/suitcase
 *
 * @param {boolean} isOverweight - Is over weight limit
 * @param {boolean} isOverCapacity - Is over capacity limit
 * @param {boolean} isFull - Is at 95%+ capacity
 * @returns {string} Status string: 'OVERWEIGHT' | 'OVER_CAPACITY' | 'FULL' | 'OK' | 'EMPTY'
 *
 * @example
 * getContainerStatus(true, false, false); // Returns 'OVERWEIGHT'
 * getContainerStatus(false, true, false); // Returns 'OVER_CAPACITY'
 * getContainerStatus(false, false, true); // Returns 'FULL'
 * getContainerStatus(false, false, false); // Returns 'OK'
 */
export const getContainerStatus = (
	isOverweight: boolean,
	isOverCapacity: boolean,
	isFull: boolean,
	itemCount: number = 0
): ContainerStatus => {
	// Priority order: OVERWEIGHT > OVER_CAPACITY > FULL > EMPTY > OK
	if (isOverweight) return ContainerStatus.OVERWEIGHT;
	if (isOverCapacity) return ContainerStatus.OVER_CAPACITY;
	if (isFull) return ContainerStatus.FULL;
	if (itemCount === 0) return ContainerStatus.EMPTY;
	return ContainerStatus.OK;
};
