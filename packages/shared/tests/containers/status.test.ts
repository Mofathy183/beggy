import { it, describe, expect } from 'vitest';
import {
	checkIsFull,
	checkIsOverCapacity,
	checkIsOverweight,
	getContainerStatus,
} from '@beggy/shared/containers';
import { ContainerStatus } from '@beggy/shared/types';

describe('checkIsOverweight()', () => {
	it('returns false when max weight is 0', () => {
		expect(checkIsOverweight(10, 0)).toBe(false);
	});

	it('returns false when max weight is negative', () => {
		expect(checkIsOverweight(10, -20)).toBe(false);
	});

	it('returns false when current weight is 0', () => {
		expect(checkIsOverweight(0, 20)).toBe(false);
	});

	it('returns false when current weight is negative', () => {
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
	it('returns false when max capacity is 0', () => {
		expect(checkIsOverCapacity(10, 0)).toBe(false);
	});

	it('returns false when max capacity is negative', () => {
		expect(checkIsOverCapacity(10, -50)).toBe(false);
	});

	it('returns false when current capacity is 0', () => {
		expect(checkIsOverCapacity(0, 50)).toBe(false);
	});

	it('returns false when current capacity is negative', () => {
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
	it('returns false when both max weight and max capacity are missing', () => {
		expect(checkIsFull(10, 0, 10, 0)).toBe(false);
	});

	it('returns true when weight is exactly 95% of max', () => {
		expect(checkIsFull(19, 20, 10, 50)).toBe(true);
	});

	it('returns true when weight is above 95% of max', () => {
		expect(checkIsFull(19.5, 20, 10, 50)).toBe(true);
	});

	it('returns true when capacity is exactly 95% of max', () => {
		expect(checkIsFull(10, 20, 47.5, 50)).toBe(true);
	});

	it('returns true when capacity is above 95% of max', () => {
		expect(checkIsFull(10, 20, 48, 50)).toBe(true);
	});

	it('returns true when only weight dimension is near full', () => {
		expect(checkIsFull(19, 20, 0, 0)).toBe(true);
	});

	it('returns true when only capacity dimension is near full', () => {
		expect(checkIsFull(0, 0, 48, 50)).toBe(true);
	});

	it('returns false when both weight and capacity are below threshold', () => {
		expect(checkIsFull(10, 20, 30, 50)).toBe(false);
	});
});

describe('getContainerStatus()', () => {
	it('returns OVERWEIGHT when overweight is true', () => {
		expect(getContainerStatus(true, false, false, 5)).toBe(
			ContainerStatus.OVERWEIGHT
		);
	});

	it('returns OVER_CAPACITY when over capacity is true and not overweight', () => {
		expect(getContainerStatus(false, true, false, 5)).toBe(
			ContainerStatus.OVER_CAPACITY
		);
	});

	it('returns FULL when full is true and not over limits', () => {
		expect(getContainerStatus(false, false, true, 5)).toBe(
			ContainerStatus.FULL
		);
	});

	it('returns EMPTY when item count is zero and no other flags are set', () => {
		expect(getContainerStatus(false, false, false, 0)).toBe(
			ContainerStatus.EMPTY
		);
	});

	it('returns OK when none of the conditions apply', () => {
		expect(getContainerStatus(false, false, false, 3)).toBe(
			ContainerStatus.OK
		);
	});

	it('prioritizes OVERWEIGHT over all other states', () => {
		expect(getContainerStatus(true, true, true, 0)).toBe(
			ContainerStatus.OVERWEIGHT
		);
	});

	it('prioritizes OVER_CAPACITY over FULL', () => {
		expect(getContainerStatus(false, true, true, 10)).toBe(
			ContainerStatus.OVER_CAPACITY
		);
	});
});
