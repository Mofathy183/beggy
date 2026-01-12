import { it, describe, expect } from 'vitest';
import { suitcaseFactory } from '@beggy/shared-factories';
import { SuitcaseSchema } from '@beggy/shared/schemas';
import {
	Size,
	SuitcaseFeature,
	SuitcaseType,
	WheelType,
} from '@beggy/shared/types';

describe('SuitcaseSchema.create', () => {
	it('accepts valid input and applies defaults', () => {
		const { userId, suitcaseWeight, ...mockSuitcase } = suitcaseFactory(
			'user-1',
			{
				type: SuitcaseType.HARD_SHELL,
				size: Size.MEDIUM,
			}
		);
		const result = SuitcaseSchema.create.parse(mockSuitcase);

		expect(result).toEqual(mockSuitcase);
	});

	it('accepts optional descriptive fields', () => {
		const { userId, suitcaseWeight, ...mockSuitcase } = suitcaseFactory(
			'user-1',
			{
				brand: 'Samsonite',
				features: [SuitcaseFeature.TSA_LOCK],
				color: 'blue',
			}
		);
		const result = SuitcaseSchema.create.parse(mockSuitcase);

		expect(result.brand).toBe('Samsonite');
		expect(result.color).toBe('blue');
		expect(result.features).toEqual([SuitcaseFeature.TSA_LOCK]);
	});

	it('rejects unknown fields', () => {
		const { userId, suitcaseWeight, ...mockSuitcase } =
			suitcaseFactory('user-1');

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
