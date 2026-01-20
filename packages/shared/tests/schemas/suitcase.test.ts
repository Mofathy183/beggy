import { it, describe, expect } from 'vitest';
import { suitcaseFactory } from '../factories/suitcase.factory';
import { SuitcaseSchema } from '../../src/schemas/suitcase.schema';
import { Size } from '../../src/constants/bag.enums';
import {
	SuitcaseFeature,
	SuitcaseType,
	WheelType,
} from '../../src/constants/suitcase.enums';

describe('SuitcaseSchema.create', () => {
	it('accepts valid input and applies defaults', () => {
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

	it('accepts optional descriptive fields', () => {
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

	it('rejects unknown fields', () => {
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

describe('SuitcaseSchema.update', () => {
	it('accepts partial updates', () => {
		const result = SuitcaseSchema.update.parse({
			color: 'red',
			wheels: WheelType.TWO_WHEEL,
		});

		expect(result).toEqual({
			color: 'red',
			wheels: WheelType.TWO_WHEEL,
		});
	});

	it('does not apply defaults', () => {
		const result = SuitcaseSchema.update.parse({});
		expect(result).toEqual({});
	});

	it('rejects unknown fields', () => {
		expect(() =>
			SuitcaseSchema.update.parse({
				size: Size.LARGE,
				adminOverride: true,
			})
		).toThrow();
	});
});
