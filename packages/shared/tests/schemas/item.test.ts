import { it, describe, expect } from 'vitest';
import { ItemSchema } from '../../src/schemas/item.schema';
import {
	ItemCategory,
	WeightUnit,
	VolumeUnit,
} from '../../src/constants/item.enums';
import { itemFactory } from '../factories/item.factory';

describe('ItemSchema.create', () => {
	it('accepts valid input and applies defaults', () => {
		const { userId: _userId, ...mockItem } = itemFactory('user-1', {
			category: ItemCategory.ELECTRONICS,
			weightUnit: WeightUnit.KILOGRAM,
			volumeUnit: VolumeUnit.ML,
		});
		const result = ItemSchema.create.parse(mockItem);

		expect(result).toEqual(mockItem);
	});

	it('accepts optional fields when provided', () => {
		const { userId: _userId, ...mockItem } = itemFactory('user-1', {
			color: 'clear',
			isFragile: true,
		});
		const result = ItemSchema.create.parse(mockItem);

		expect(result.color).toBe('clear');
		expect(result.isFragile).toBe(true);
	});

	it('rejects unknown fields', () => {
		const { userId: _userId, ...mockItem } = itemFactory('user-1');
		expect(() =>
			ItemSchema.create.parse({
				...mockItem,
				adminOnly: true,
			})
		).toThrow();
	});
});

describe('ItemSchema.update', () => {
	it('accepts partial updates', () => {
		const result = ItemSchema.update.parse({
			quantity: 3,
			isFragile: true,
		});

		expect(result).toEqual({
			quantity: 3,
			isFragile: true,
		});
	});

	it('does not apply defaults', () => {
		const result = ItemSchema.update.parse({});

		expect(result).toEqual({});
	});

	it('rejects unknown fields', () => {
		expect(() =>
			ItemSchema.update.parse({
				color: 'red',
				internalFlag: true,
			})
		).toThrow();
	});
});
