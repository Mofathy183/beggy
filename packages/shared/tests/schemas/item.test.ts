import { it, describe, expect } from 'vitest';
import { ItemSchema } from '../../src/schemas/item.schema';
import {
	ItemCategory,
	WeightUnit,
	VolumeUnit,
} from '../../src/constants/item.enums';
import { itemFactory } from '../factories/item.factory';

describe('ItemSchema.create()', () => {
	it('parses valid input and applies default values', () => {
		const { userId: _userId, ...mockItem } = itemFactory('user-1', {
			category: ItemCategory.ELECTRONICS,
			weightUnit: WeightUnit.KILOGRAM,
			volumeUnit: VolumeUnit.ML,
		});
		const result = ItemSchema.create.parse(mockItem);

		expect(result).toEqual(mockItem);
	});

	it('parses optional fields when they are provided', () => {
		const { userId: _userId, ...mockItem } = itemFactory('user-1', {
			color: 'clear',
			isFragile: true,
		});
		const result = ItemSchema.create.parse(mockItem);

		expect(result.color).toBe('clear');
		expect(result.isFragile).toBe(true);
	});

	it('throws when unknown fields are provided', () => {
		const { userId: _userId, ...mockItem } = itemFactory('user-1');
		expect(() =>
			ItemSchema.create.parse({
				...mockItem,
				adminOnly: true,
			})
		).toThrow();
	});
});

describe('ItemSchema.update()', () => {
	it('parses partial update payloads', () => {
		const result = ItemSchema.update.parse({
			quantity: 3,
			isFragile: true,
		});

		expect(result).toEqual({
			quantity: 3,
			isFragile: true,
		});
	});

	it('returns an empty object when no fields are provided', () => {
		const result = ItemSchema.update.parse({});

		expect(result).toEqual({});
	});

	it('throws when unknown fields are provided', () => {
		expect(() =>
			ItemSchema.update.parse({
				color: 'red',
				internalFlag: true,
			})
		).toThrow();
	});
});
