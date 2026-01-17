import { it, describe, expect } from 'vitest';
import { BagSchema } from '../../src/schemas/bag.schema';
import { BagFeature } from '../../src/constants/bag.enums';
import { bagFactory } from '../../src/testing/factories/bag.factory';

describe('BagSchema.create', () => {
	it('accepts valid input and applies defaults', () => {
		const {
			userId: _userId,
			bagWeight: _bagWeight,
			...mockBag
		} = bagFactory('user-1');
		const result = BagSchema.create.parse(mockBag);

		expect(result).toEqual(mockBag);
	});

	it('accepts optional fields when provided', () => {
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

	it('rejects unknown fields', () => {
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

describe('BagSchema.update', () => {
	it('accepts partial updates', () => {
		const result = BagSchema.update.parse({
			name: 'Updated Bag Name',
			maxWeight: 18,
		});

		expect(result).toEqual({
			name: 'Updated Bag Name',
			maxWeight: 18,
		});
	});

	it('does not apply defaults during update', () => {
		const result = BagSchema.update.parse({});

		expect(result).toEqual({});
	});

	it('rejects unknown fields', () => {
		expect(() =>
			BagSchema.update.parse({
				color: 'blue',
				isAdminOnly: true,
			})
		).toThrow();
	});
});
