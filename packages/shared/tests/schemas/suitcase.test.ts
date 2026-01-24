import { it, describe, expect } from 'vitest';
import { suitcaseFactory } from '../factories/suitcase.factory';
import { SuitcaseSchema } from '../../src/schemas/suitcase.schema';
import { Size } from '../../src/constants/bag.enums';
import {
	SuitcaseFeature,
	SuitcaseType,
	WheelType,
} from '../../src/constants/suitcase.enums';

describe('SuitcaseSchema.create()', () => {
	it('parses valid input and applies default values', () => {
		const {
			userId: _userId,
			suitcaseWeight: _suitcaseWeight,
			...mockSuitcase
		} = suitcaseFactory('user-1', {
			type: SuitcaseType.HARD_SHELL,
			size: Size.MEDIUM,
		});
		const result = SuitcaseSchema.create.parse(mockSuitcase);

		expect(result).toEqual(mockSuitcase);
	});

	it('parses optional descriptive fields when provided', () => {
		const {
			userId: _userId,
			suitcaseWeight: _suitcaseWeight,
			...mockSuitcase
		} = suitcaseFactory('user-1', {
			brand: 'Samsonite',
			features: [SuitcaseFeature.TSA_LOCK],
			color: 'blue',
		});
		const result = SuitcaseSchema.create.parse(mockSuitcase);

		expect(result.brand).toBe('Samsonite');
		expect(result.color).toBe('blue');
		expect(result.features).toEqual([SuitcaseFeature.TSA_LOCK]);
	});

	it('throws when unknown fields are provided', () => {
		const {
			userId: _userId,
			suitcaseWeight: _suitcaseWeight,
			...mockSuitcase
		} = suitcaseFactory('user-1');

		expect(() =>
			SuitcaseSchema.create.parse({
				...mockSuitcase,
				internalFlag: true,
			})
		).toThrow();
	});
});

describe('SuitcaseSchema.update()', () => {
	it('parses partial update payloads', () => {
		const result = SuitcaseSchema.update.parse({
			color: 'red',
			wheels: WheelType.TWO_WHEEL,
		});

		expect(result).toEqual({
			color: 'red',
			wheels: WheelType.TWO_WHEEL,
		});
	});

	it('parses an empty object without applying defaults', () => {
		const result = SuitcaseSchema.update.parse({});
		expect(result).toEqual({});
	});

	it('throws when unknown fields are provided', () => {
		expect(() =>
			SuitcaseSchema.update.parse({
				size: Size.LARGE,
				adminOverride: true,
			})
		).toThrow();
	});
});
