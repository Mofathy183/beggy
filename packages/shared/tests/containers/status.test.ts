import { it, describe, expect } from 'vitest';
import {
	checkIsFull,
	checkIsOverCapacity,
	checkIsOverweight,
	getContainerStatus,
} from '../../src/containers/status';
import {
	ContainerStatus,
	ContainerStatusReason,
} from '../../src/constants/constraints.enums';

describe('checkIsOverweight()', () => {
	it('returns false when max weight is missing', () => {
		expect(checkIsOverweight(10, 0)).toBe(false);
	});

	it('returns false when max weight is invalid', () => {
		expect(checkIsOverweight(10, -20)).toBe(false);
	});

	it('returns false when current weight is missing', () => {
		expect(checkIsOverweight(0, 20)).toBe(false);
	});

	it('returns false when current weight is invalid', () => {
		expect(checkIsOverweight(-5, 20)).toBe(false);
	});

	it('returns false when current weight equals max weight', () => {
		expect(checkIsOverweight(20, 20)).toBe(false);
	});

	it('returns true when current weight exceeds max weight', () => {
		expect(checkIsOverweight(22.5, 20)).toBe(true);
	});
});

describe('checkIsOverCapacity()', () => {
	it('returns false when max capacity is missing', () => {
		expect(checkIsOverCapacity(10, 0)).toBe(false);
	});

	it('returns false when max capacity is invalid', () => {
		expect(checkIsOverCapacity(10, -50)).toBe(false);
	});

	it('returns false when current capacity is missing', () => {
		expect(checkIsOverCapacity(0, 50)).toBe(false);
	});

	it('returns false when current capacity is invalid', () => {
		expect(checkIsOverCapacity(-10, 50)).toBe(false);
	});

	it('returns false when current capacity equals max capacity', () => {
		expect(checkIsOverCapacity(50, 50)).toBe(false);
	});

	it('returns true when current capacity exceeds max capacity', () => {
		expect(checkIsOverCapacity(55, 50)).toBe(true);
	});
});

describe('checkIsFull()', () => {
	it('returns false when both limits are missing', () => {
		expect(checkIsFull(10, 0, 10, 0)).toBe(false);
	});

	it('returns true when weight reaches near-limit threshold', () => {
		expect(checkIsFull(19, 20, 10, 50)).toBe(true);
	});

	it('returns true when weight exceeds near-limit threshold', () => {
		expect(checkIsFull(19.5, 20, 10, 50)).toBe(true);
	});

	it('returns true when capacity reaches near-limit threshold', () => {
		expect(checkIsFull(10, 20, 47.5, 50)).toBe(true);
	});

	it('returns true when capacity exceeds near-limit threshold', () => {
		expect(checkIsFull(10, 20, 48, 50)).toBe(true);
	});

	it('returns true when only weight is near limit', () => {
		expect(checkIsFull(19, 20, 0, 0)).toBe(true);
	});

	it('returns true when only capacity is near limit', () => {
		expect(checkIsFull(0, 0, 48, 50)).toBe(true);
	});

	it('returns false when both dimensions are below threshold', () => {
		expect(checkIsFull(10, 20, 30, 50)).toBe(false);
	});
});

describe('getContainerStatus()', () => {
	it('returns EMPTY when container has no items', () => {
		// Arrange
		const params = {
			itemCount: 0,
			isOverweight: true,
			isOverCapacity: true,
			isWeightNearLimit: true,
			isCapacityNearLimit: true,
		};

		// Act
		const result = getContainerStatus(params);

		// Assert
		expect(result).toEqual({
			status: ContainerStatus.EMPTY,
			reasons: [ContainerStatusReason.EMPTY],
		});
	});

	it('returns OVERWEIGHT when weight exceeds limit', () => {
		// Arrange
		const params = {
			itemCount: 3,
			isOverweight: true,
			isOverCapacity: true,
			isWeightNearLimit: false,
			isCapacityNearLimit: false,
		};

		// Act
		const result = getContainerStatus(params);

		// Assert
		expect(result.status).toBe(ContainerStatus.OVERWEIGHT);
		expect(result.reasons).toContain(
			ContainerStatusReason.WEIGHT_OVER_LIMIT
		);
		expect(result.reasons).toContain(
			ContainerStatusReason.CAPACITY_OVER_LIMIT
		);
	});

	it('returns OVER_CAPACITY when capacity exceeds limit without overweight', () => {
		// Arrange
		const params = {
			itemCount: 4,
			isOverweight: false,
			isOverCapacity: true,
			isWeightNearLimit: true,
			isCapacityNearLimit: false,
		};

		// Act
		const result = getContainerStatus(params);

		// Assert
		expect(result).toEqual({
			status: ContainerStatus.OVER_CAPACITY,
			reasons: [
				ContainerStatusReason.WEIGHT_NEAR_LIMIT,
				ContainerStatusReason.CAPACITY_OVER_LIMIT,
			],
		});
	});

	it('returns FULL when near capacity or weight limit', () => {
		// Arrange
		const params = {
			itemCount: 5,
			isOverweight: false,
			isOverCapacity: false,
			isWeightNearLimit: true,
			isCapacityNearLimit: false,
		};

		// Act
		const result = getContainerStatus(params);

		// Assert
		expect(result).toEqual({
			status: ContainerStatus.FULL,
			reasons: [ContainerStatusReason.WEIGHT_NEAR_LIMIT],
		});
	});

	it('returns OK when container is within safe limits', () => {
		// Arrange
		const params = {
			itemCount: 2,
			isOverweight: false,
			isOverCapacity: false,
			isWeightNearLimit: false,
			isCapacityNearLimit: false,
		};

		// Act
		const result = getContainerStatus(params);

		// Assert
		expect(result).toEqual({
			status: ContainerStatus.OK,
			reasons: [],
		});
	});

	it('ignores near-limit reasons when over-limit applies', () => {
		// Arrange
		const params = {
			itemCount: 6,
			isOverweight: true,
			isOverCapacity: false,
			isWeightNearLimit: true,
			isCapacityNearLimit: true,
		};

		// Act
		const result = getContainerStatus(params);

		// Assert
		expect(result.reasons).toEqual([
			ContainerStatusReason.WEIGHT_OVER_LIMIT,
			ContainerStatusReason.CAPACITY_NEAR_LIMIT,
		]);
		expect(result.status).toBe(ContainerStatus.OVERWEIGHT);
	});
});
