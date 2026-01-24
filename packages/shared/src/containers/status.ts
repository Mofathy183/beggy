import {
	ContainerStatus,
	ContainerStatusReason,
} from '../constants/constraints.enums.js';
import type { ContainerStatusResult, ContainerStatusParams } from "../types/constraints.types.js"
// ============================================================================
// STATUS CHECK FUNCTIONS
// ============================================================================

/**
 * Determines whether the container exceeds its maximum allowed weight.
 *
 * @param currentWeight - Current total item weight in kilograms
 * @param maxWeight - Maximum allowed weight in kilograms
 * @returns True if the container is overweight, otherwise false
 *
 * @remarks
 * - Containers without a defined max weight are never considered overweight
 * - Zero or negative current weights are treated as safe
 *
 * @example
 * checkIsOverweight(22.5, 20.0); // true
 * checkIsOverweight(18.0, 20.0); // false
 * checkIsOverweight(0, 20.0);    // false
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
 * Determines whether the container exceeds its maximum allowed volume.
 *
 * @param currentCapacity - Current used volume in liters
 * @param maxCapacity - Maximum allowed volume in liters
 * @returns True if the container is over capacity, otherwise false
 *
 * @remarks
 * - Containers without a defined max capacity are never considered overfilled
 * - Zero or negative volumes are treated as safe
 *
 * @example
 * checkIsOverCapacity(55.0, 50.0); // true
 * checkIsOverCapacity(45.0, 50.0); // false
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
 * Determines whether a container is considered "full".
 *
 * A container is marked as full when EITHER:
 * - Weight utilization reaches or exceeds 95% of the maximum weight, OR
 * - Volume utilization reaches or exceeds 95% of the maximum capacity
 *
 * @param currentWeight - Current total item weight in kilograms
 * @param maxWeight - Maximum allowed weight in kilograms
 * @param currentCapacity - Current used volume in liters
 * @param maxCapacity - Maximum allowed volume in liters
 * @returns True if the container is considered full, otherwise false
 *
 * @remarks
 * - Overweight or over-capacity states are evaluated separately
 * - Full is an early warning state, not a hard failure
 *
 * @example
 * checkIsFull(19.0, 20.0, 45.0, 50.0); // true (95% weight)
 * checkIsFull(15.0, 20.0, 48.0, 50.0); // true (96% capacity)
 * checkIsFull(10.0, 20.0, 30.0, 50.0); // false
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
 * Derives explanatory reasons describing the container state.
 *
 * @remarks
 * - Reasons are additive (multiple may apply)
 * - Over-limit reasons suppress near-limit reasons
 * - EMPTY is treated as a reason, not a status
 */
const resolveStatusReasons = (
	params: ContainerStatusParams
): ContainerStatusReason[] => {
	const reasons: ContainerStatusReason[] = [];

	if (params.itemCount === 0) {
		reasons.push(ContainerStatusReason.EMPTY);
		return reasons; // empty container has no other meaningful reasons
	}

	if (params.isOverweight) {
		reasons.push(ContainerStatusReason.WEIGHT_OVER_LIMIT);
	} else if (params.isWeightNearLimit) {
		reasons.push(ContainerStatusReason.WEIGHT_NEAR_LIMIT);
	}

	if (params.isOverCapacity) {
		reasons.push(ContainerStatusReason.CAPACITY_OVER_LIMIT);
	} else if (params.isCapacityNearLimit) {
		reasons.push(ContainerStatusReason.CAPACITY_NEAR_LIMIT);
	}

	return reasons;
};

/**
 * Resolves the final container status from derived reasons.
 *
 * Priority (highest → lowest):
 * 1. OVERWEIGHT
 * 2. OVER_CAPACITY
 * 3. FULL
 * 4. EMPTY
 * 5. OK
 */
const resolveContainerState = (
	reasons: ContainerStatusReason[]
): ContainerStatus => {
	if (reasons.includes(ContainerStatusReason.WEIGHT_OVER_LIMIT)) {
		return ContainerStatus.OVERWEIGHT;
	}

	if (reasons.includes(ContainerStatusReason.CAPACITY_OVER_LIMIT)) {
		return ContainerStatus.OVER_CAPACITY;
	}

	if (
		reasons.includes(ContainerStatusReason.WEIGHT_NEAR_LIMIT) ||
		reasons.includes(ContainerStatusReason.CAPACITY_NEAR_LIMIT)
	) {
		return ContainerStatus.FULL;
	}

	if (reasons.includes(ContainerStatusReason.EMPTY)) {
		return ContainerStatus.EMPTY;
	}

	return ContainerStatus.OK;
};

/**
 * Computes the final derived status of a container (bag or suitcase)
 * along with the reasons explaining that status.
 *
 * This is the **single public entry point** for container state resolution.
 * All calculations (weights, capacities, percentages) must be performed
 * upstream and passed in as factual boolean flags.
 *
 * @param params - Derived container facts based on calculation results
 *
 * @returns An object containing:
 * - `status`: high-level container status used by the domain and UI
 * - `reasons`: granular explanatory reasons for warnings and tooltips
 *
 * @remarks
 * - This function is **pure** and side-effect free
 * - It does NOT perform any calculations
 * - It only interprets already-derived facts
 * - Internal helper functions are intentionally not exported
 *
 * @example
 * getContainerStatus({
 *   isOverweight: false,
 *   isOverCapacity: false,
 *   isWeightNearLimit: true,
 *   isCapacityNearLimit: false,
 *   itemCount: 5
 * });
 * // → { status: 'full', reasons: ['weight_near_limit'] }
 */
export const getContainerStatus = (
	params: ContainerStatusParams
): ContainerStatusResult => {
	const reasons = resolveStatusReasons(params);
	const status = resolveContainerState(reasons);

	return { status, reasons };
};
