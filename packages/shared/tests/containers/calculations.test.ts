import { it, describe, expect } from 'vitest';
import { buildContainerItem } from '../factories/constraints.factory';
import {
	calculateCurrentCapacity,
	calculateCurrentWeight,
	calculateRemainingCapacity,
	calculateRemainingWeight,
	calculateTotalWeightWithContainer,
	calculateWeightPercentage,
	convertToKilogram,
	convertToLiter,
	calculateCapacityPercentage,
} from '../../src/containers/calculations';
import { WeightUnit, VolumeUnit } from '../../src/constants/item.enums';

describe('convertToKilogram()', () => {
	it('returns the same value when unit is kilogram', () => {
		expect(convertToKilogram(5, WeightUnit.KILOGRAM)).toBe(5);
	});

	it('converts grams to kilograms', () => {
		expect(convertToKilogram(1000, WeightUnit.GRAM)).toBe(1);
		expect(convertToKilogram(2500, WeightUnit.GRAM)).toBe(2.5);
	});

	it('converts pounds to kilograms', () => {
		expect(convertToKilogram(2.2, WeightUnit.POUND)).toBeCloseTo(0.998, 3);
	});

	it('converts ounces to kilograms', () => {
		expect(convertToKilogram(35.274, WeightUnit.OUNCE)).toBeCloseTo(1, 6);
	});
});

describe('convertToLiter()', () => {
	it('returns the same value when unit is liter', () => {
		expect(convertToLiter(5, VolumeUnit.LITER)).toBe(5);
	});

	it('converts milliliters to liters', () => {
		expect(convertToLiter(1000, VolumeUnit.ML)).toBe(1);
		expect(convertToLiter(2500, VolumeUnit.ML)).toBe(2.5);
	});

	it('converts cubic centimeters to liters', () => {
		expect(convertToLiter(1000, VolumeUnit.CU_CM)).toBe(1);
		expect(convertToLiter(1500, VolumeUnit.CU_CM)).toBe(1.5);
	});

	it('converts cubic inches to liters', () => {
		expect(convertToLiter(61.0237, VolumeUnit.CU_IN)).toBeCloseTo(1, 4);
	});
});

describe('calculateCurrentWeight()', () => {
	it('returns 0 when items are empty', () => {
		expect(calculateCurrentWeight([])).toBe(0);
	});

	it('returns 0 when items are missing', () => {
		expect(calculateCurrentWeight(undefined as any)).toBe(0);
	});

	it('calculates total weight using item quantity', () => {
		const items = [
			buildContainerItem({
				quantity: 3, // 6 kg
				item: {
					weight: 2,
					weightUnit: WeightUnit.KILOGRAM,
				},
			}),
		];

		expect(calculateCurrentWeight(items)).toBe(6);
	});

	it('sums weight across multiple items', () => {
		const items = [
			buildContainerItem({
				quantity: 2, // 2 kg
				item: {
					weight: 1,
					weightUnit: WeightUnit.KILOGRAM,
				},
			}),
			buildContainerItem({
				quantity: 2, // 1 kg
				item: {
					weight: 500,
					weightUnit: WeightUnit.GRAM,
				},
			}),
		];

		expect(calculateCurrentWeight(items)).toBe(3);
	});

	it('handles mixed weight units', () => {
		const items = [
			buildContainerItem({
				quantity: 1, // 1 kg
				item: {
					weight: 1000,
					weightUnit: WeightUnit.GRAM,
				},
			}),
			buildContainerItem({
				quantity: 1, // ≈ 1 kg
				item: {
					weight: 2.20462,
					weightUnit: WeightUnit.POUND,
				},
			}),
		];

		expect(calculateCurrentWeight(items)).toBe(2);
	});

	it('rounds the result to 2 decimal places', () => {
		const items = [
			buildContainerItem({
				quantity: 2, // ≈ 1.999994 kg
				item: {
					weight: 2.20462,
					weightUnit: WeightUnit.POUND,
				},
			}),
		];

		expect(calculateCurrentWeight(items)).toBe(2);
	});
});

describe('calculateTotalWeightWithContainer()', () => {
	it('returns container weight when items are empty', () => {
		expect(calculateTotalWeightWithContainer([], 2.5)).toBe(2.5);
	});

	it('adds container weight to item weight', () => {
		const items = [
			buildContainerItem({
				quantity: 1, // 5 kg
				item: {
					weight: 5,
					weightUnit: WeightUnit.KILOGRAM,
				},
			}),
		];

		expect(calculateTotalWeightWithContainer(items, 2.5)).toBe(7.5);
	});

	it('rounds the final result to 2 decimal places', () => {
		const items = [
			buildContainerItem({
				quantity: 1, // ≈ 1 kg
				item: {
					weight: 2.20462,
					weightUnit: WeightUnit.POUND,
				},
			}),
		];

		// items ≈ 1.00 + container 2.555 = 3.555 → 3.56
		expect(calculateTotalWeightWithContainer(items, 2.555)).toBe(3.56);
	});
});

describe('calculateCurrentCapacity()', () => {
	it('returns 0 when items are empty', () => {
		expect(calculateCurrentCapacity([])).toBe(0);
	});

	it('returns 0 when items are missing', () => {
		expect(calculateCurrentCapacity(undefined as any)).toBe(0);
	});

	it('calculates capacity using item quantity', () => {
		const items = [
			buildContainerItem({
				quantity: 3, // 6 L
				item: {
					volume: 2,
					volumeUnit: VolumeUnit.LITER,
				},
			}),
		];

		expect(calculateCurrentCapacity(items)).toBe(6);
	});

	it('sums capacity across multiple items', () => {
		const items = [
			buildContainerItem({
				quantity: 2, // 1 L
				item: {
					volume: 500,
					volumeUnit: VolumeUnit.ML,
				},
			}),
			buildContainerItem({
				quantity: 2, // 3 L
				item: {
					volume: 1.5,
					volumeUnit: VolumeUnit.LITER,
				},
			}),
		];

		expect(calculateCurrentCapacity(items)).toBe(4);
	});

	it('sums capacity across multiple items', () => {
		const items = [
			buildContainerItem({
				quantity: 1, // 1 L
				item: {
					volume: 1000,
					volumeUnit: VolumeUnit.CU_CM,
				},
			}),
			buildContainerItem({
				quantity: 1, // ≈ 1 L
				item: {
					volume: 61.0237,
					volumeUnit: VolumeUnit.CU_IN,
				},
			}),
		];

		expect(calculateCurrentCapacity(items)).toBe(2);
	});

	it('rounds the result to 2 decimal places', () => {
		const items = [
			buildContainerItem({
				quantity: 3, // ≈ 3.00001 L
				item: {
					volume: 61.0237,
					volumeUnit: VolumeUnit.CU_IN,
				},
			}),
		];

		expect(calculateCurrentCapacity(items)).toBe(3);
	});
});

describe('calculateRemainingWeight()', () => {
	it('returns remaining weight when under the limit', () => {
		expect(calculateRemainingWeight(15.5, 20)).toBe(4.5);
	});

	it('returns 0 when weight exceeds the limit', () => {
		expect(calculateRemainingWeight(25, 20)).toBe(0);
	});

	it('returns 0 when max weight is missing', () => {
		expect(calculateRemainingWeight(10, 0)).toBe(0);
	});

	it('returns 0 when max weight is invalid', () => {
		expect(calculateRemainingWeight(10, -5)).toBe(0);
	});

	it('rounds the result to 2 decimal places', () => {
		expect(calculateRemainingWeight(19.999, 20)).toBe(0);
		expect(calculateRemainingWeight(19.994, 20)).toBe(0.01);
	});
});

describe('calculateRemainingCapacity()', () => {
	it('returns remaining capacity when under the limit', () => {
		expect(calculateRemainingCapacity(35.5, 50)).toBe(14.5);
	});

	it('returns 0 when capacity exceeds the limit', () => {
		expect(calculateRemainingCapacity(55, 50)).toBe(0);
	});

	it('returns 0 when max capacity is 0', () => {
		expect(calculateRemainingCapacity(10, 0)).toBe(0);
	});

	it('returns 0 when max capacity is negative', () => {
		expect(calculateRemainingCapacity(10, -20)).toBe(0);
	});

	it('rounds the result to 2 decimal places', () => {
		expect(calculateRemainingCapacity(49.999, 50)).toBe(0);
		expect(calculateRemainingCapacity(49.994, 50)).toBe(0.01);
	});
});

describe('calculateWeightPercentage()', () => {
	it('returns 0 when max weight is missing', () => {
		expect(calculateWeightPercentage(10, 0)).toBe(0);
	});

	it('returns 0 when max weight is invalid', () => {
		expect(calculateWeightPercentage(10, -20)).toBe(0);
	});

	it('returns 0 when current weight is missing', () => {
		expect(calculateWeightPercentage(0, 20)).toBe(0);
	});

	it('returns 0 when current weight is invalid', () => {
		expect(calculateWeightPercentage(-5, 20)).toBe(0);
	});

	it('calculates percentage under the limit', () => {
		expect(calculateWeightPercentage(15, 20)).toBe(75);
	});

	it('calculates percentage over the limit', () => {
		expect(calculateWeightPercentage(22, 20)).toBe(110);
	});

	it('rounds the result to 1 decimal place', () => {
		expect(calculateWeightPercentage(5.5, 20)).toBe(27.5);
		expect(calculateWeightPercentage(1, 3)).toBe(33.3);
	});
});

describe('calculateCapacityPercentage()', () => {
	it('returns 0 when max capacity is missing', () => {
		expect(calculateCapacityPercentage(10, 0)).toBe(0);
	});

	it('returns 0 when max capacity is invalid', () => {
		expect(calculateCapacityPercentage(10, -50)).toBe(0);
	});

	it('returns 0 when current capacity is missing', () => {
		expect(calculateCapacityPercentage(0, 50)).toBe(0);
	});

	it('returns 0 when current capacity is invalid', () => {
		expect(calculateCapacityPercentage(-10, 50)).toBe(0);
	});

	it('calculates percentage under the limit', () => {
		expect(calculateCapacityPercentage(40, 50)).toBe(80);
	});

	it('calculates percentage over the limit', () => {
		expect(calculateCapacityPercentage(55, 50)).toBe(110);
	});

	it('rounds the result to 1 decimal place', () => {
		expect(calculateCapacityPercentage(12.5, 50)).toBe(25);
		expect(calculateCapacityPercentage(1, 6)).toBe(16.7);
	});
});
