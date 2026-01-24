import { it, describe, expect } from 'vitest';
import { BagSchema } from '../../src/schemas/bag.schema';
import { BagFeature } from '../../src/constants/bag.enums';
import { bagFactory } from '../factories/bag.factory';

describe('BagSchema.create()', () => {
	it('parses valid input and applies default values', () => {
		const {
			userId: _userId,
			bagWeight: _bagWeight,
			...mockBag
		} = bagFactory('user-1');
		const result = BagSchema.create.parse(mockBag);

		expect(result).toEqual(mockBag);
	});

	it('parses optional fields when they are provided', () => {
		const {
			userId: _userId,
			bagWeight: _bagWeight,
			...mockBag
		} = bagFactory('user-1', {
			color: 'red',
			features: [BagFeature.WATERPROOF],
		});
		const result = BagSchema.create.parse(mockBag);

		expect(result.features).toEqual([BagFeature.WATERPROOF]);
		expect(result.color).toBe('red');
	});

	it('throws when unknown fields are provided', () => {
		const {
			userId: _userId,
			bagWeight: _bagWeight,
			...mockBag
		} = bagFactory('user-1');

		expect(() =>
			BagSchema.create.parse({
				...mockBag,
				hacked: true,
			})
		).toThrow();
	});
});

describe('BagSchema.update()', () => {
	it('parses partial update payloads', () => {
		const result = BagSchema.update.parse({
			name: 'Updated Bag Name',
			maxWeight: 18,
		});

		expect(result).toEqual({
			name: 'Updated Bag Name',
			maxWeight: 18,
		});
	});

	it('returns an empty object when no fields are provided', () => {
		const result = BagSchema.update.parse({});

		expect(result).toEqual({});
	});

	it('throws when unknown fields are provided', () => {
		expect(() =>
			BagSchema.update.parse({
				color: 'blue',
				isAdminOnly: true,
			})
		).toThrow();
	});
});
