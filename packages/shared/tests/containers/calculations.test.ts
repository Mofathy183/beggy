import { it, describe, expect } from 'vitest';
import { buildBagItem } from '../../src/testing/factories/bag.factory';
import {
	calculateCurrentCapacity,
	calculateCurrentWeight,
	calculateItemCount,
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
	it('returns the same value for kilograms', () => {
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
	it('returns the same value for liters', () => {
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

	it('returns 0 when items are undefined', () => {
		expect(calculateCurrentWeight(undefined as any)).toBe(0);
	});

	it('calculates total weight using item quantity', () => {
		const items = [
			buildBagItem(
				{ userId: 'user-1' },
				{},
				{
					weight: 2,
					weightUnit: WeightUnit.KILOGRAM,
					quantity: 3, // 6 kg
				}
			),
		];

		expect(calculateCurrentWeight(items)).toBe(6);
	});

	it('sums weights across multiple items', () => {
		const items = [
			buildBagItem(
				{ userId: 'user-1' },
				{},
				{
					weight: 1,
					weightUnit: WeightUnit.KILOGRAM,
					quantity: 2, // 2 kg
				}
			),
			buildBagItem(
				{ userId: 'user-1' },
				{},
				{
					weight: 500,
					weightUnit: WeightUnit.GRAM,
					quantity: 2, // 1 kg
				}
			),
		];

		expect(calculateCurrentWeight(items)).toBe(3);
	});

	it('handles mixed weight units correctly', () => {
		const items = [
			buildBagItem(
				{ userId: 'user-1' },
				{},
				{
					weight: 1000,
					weightUnit: WeightUnit.GRAM,
					quantity: 1, // 1 kg
				}
			),
			buildBagItem(
				{ userId: 'user-1' },
				{},
				{
					weight: 2.20462,
					weightUnit: WeightUnit.POUND,
					quantity: 1, // ≈ 1 kg
				}
			),
		];

		expect(calculateCurrentWeight(items)).toBe(2);
	});

	it('rounds the result to 2 decimal places', () => {
		const items = [
			buildBagItem(
				{ userId: 'user-1' },
				{},
				{
					weight: 2.20462,
					weightUnit: WeightUnit.POUND,
					quantity: 2, // ≈ 1.999994 kg
				}
			),
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
			buildBagItem(
				{ userId: 'user-1' },
				{},
				{
					weight: 5,
					weightUnit: WeightUnit.KILOGRAM,
					quantity: 1, // 5 kg
				}
			),
		];

		expect(calculateTotalWeightWithContainer(items, 2.5)).toBe(7.5);
	});

	it('rounds the final result to 2 decimal places', () => {
		const items = [
			buildBagItem(
				{ userId: 'user-1' },
				{},
				{
					weight: 2.20462,
					weightUnit: WeightUnit.POUND,
					quantity: 1, // ≈ 1 kg
				}
			),
		];

		// items ≈ 1.00 + container 2.555 = 3.555 → 3.56
		expect(calculateTotalWeightWithContainer(items, 2.555)).toBe(3.56);
	});
});

describe('calculateCurrentCapacity()', () => {
	it('returns 0 when items are empty', () => {
		expect(calculateCurrentCapacity([])).toBe(0);
	});

	it('returns 0 when items are undefined', () => {
		expect(calculateCurrentCapacity(undefined as any)).toBe(0);
	});

	it('calculates capacity using item quantity', () => {
		const items = [
			buildBagItem(
				{ userId: 'user-1' },
				{},
				{
					volume: 2,
					volumeUnit: VolumeUnit.LITER,
					quantity: 3, // 6 L
				}
			),
		];

		expect(calculateCurrentCapacity(items)).toBe(6);
	});

	it('sums capacity across multiple items', () => {
		const items = [
			buildBagItem(
				{ userId: 'user-1' },
				{},
				{
					volume: 500,
					volumeUnit: VolumeUnit.ML,
					quantity: 2, // 1 L
				}
			),
			buildBagItem(
				{ userId: 'user-1' },
				{},
				{
					volume: 1.5,
					volumeUnit: VolumeUnit.LITER,
					quantity: 2, // 3 L
				}
			),
		];

		expect(calculateCurrentCapacity(items)).toBe(4);
	});

	it('handles mixed volume units correctly', () => {
		const items = [
			buildBagItem(
				{ userId: 'user-1' },
				{},
				{
					volume: 1000,
					volumeUnit: VolumeUnit.CU_CM,
					quantity: 1, // 1 L
				}
			),
			buildBagItem(
				{ userId: 'user-1' },
				{},
				{
					volume: 61.0237,
					volumeUnit: VolumeUnit.CU_IN,
					quantity: 1, // ≈ 1 L
				}
			),
		];

		expect(calculateCurrentCapacity(items)).toBe(2);
	});

	it('rounds the result to 2 decimal places', () => {
		const items = [
			buildBagItem(
				{ userId: 'user-1' },
				{},
				{
					volume: 61.0237,
					volumeUnit: VolumeUnit.CU_IN,
					quantity: 3, // ≈ 3.00001 L
				}
			),
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

	it('returns 0 when max weight is 0', () => {
		expect(calculateRemainingWeight(10, 0)).toBe(0);
	});

	it('returns 0 when max weight is negative', () => {
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

describe('calculateItemCount()', () => {
	it('returns 0 when items are empty', () => {
		expect(calculateItemCount([])).toBe(0);
	});

	it('returns 0 when items are undefined', () => {
		expect(calculateItemCount(undefined as any)).toBe(0);
	});

	it('counts quantity for a single item', () => {
		const items = [
			buildBagItem(
				{ userId: 'user-1' },
				{},
				{
					quantity: 3,
				}
			),
		];

		expect(calculateItemCount(items)).toBe(3);
	});

	it('sums quantities across multiple items', () => {
		const items = [
			buildBagItem(
				{ userId: 'user-1' },
				{},
				{
					quantity: 3,
				}
			),
			buildBagItem(
				{ userId: 'user-1' },
				{},
				{
					quantity: 2,
				}
			),
			buildBagItem(
				{ userId: 'user-1' },
				{},
				{
					quantity: 1,
				}
			),
		];

		expect(calculateItemCount(items)).toBe(6);
	});
});

describe('calculateWeightPercentage()', () => {
	it('returns 0 when max weight is 0', () => {
		expect(calculateWeightPercentage(10, 0)).toBe(0);
	});

	it('returns 0 when max weight is negative', () => {
		expect(calculateWeightPercentage(10, -20)).toBe(0);
	});

	it('returns 0 when current weight is 0', () => {
		expect(calculateWeightPercentage(0, 20)).toBe(0);
	});

	it('returns 0 when current weight is negative', () => {
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
	it('returns 0 when max capacity is 0', () => {
		expect(calculateCapacityPercentage(10, 0)).toBe(0);
	});

	it('returns 0 when max capacity is negative', () => {
		expect(calculateCapacityPercentage(10, -50)).toBe(0);
	});

	it('returns 0 when current capacity is 0', () => {
		expect(calculateCapacityPercentage(0, 50)).toBe(0);
	});

	it('returns 0 when current capacity is negative', () => {
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
