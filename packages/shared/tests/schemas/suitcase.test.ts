import { describe, it, expect } from 'vitest';
import { suitcaseFactory } from '../factories/suitcase.factory';
import { SuitcaseSchema } from '../../src/schemas/suitcase.schema';
import { Size } from '../../src/constants/bag.enums';
import { SuitcaseFeature, WheelType } from '../../src/constants/suitcase.enums';

describe('SuitcaseSchema', () => {
	describe('create', () => {
		it('accepts valid input', () => {
			// Arrange
			const {
				userId: _userId,
				containerId: _containerId,
				...input
			} = suitcaseFactory('user-1');

			// Act
			const result = SuitcaseSchema.create.parse(input);

			// Assert
			expect(result.name).toBe(input.name);
			expect(result.type).toBe(input.type);
			expect(result.size).toBe(input.size);
		});

		it('applies default values when optional fields are missing', () => {
			// Arrange
			const {
				userId: _userId,
				containerId: _containerId,
				color: _color,
				emptyWeight: _emptyWeight,
				...input
			} = suitcaseFactory('user-1', {
				color: undefined,
				emptyWeight: undefined,
			});

			// Act
			const result = SuitcaseSchema.create.parse(input);

			// Assert
			expect(result.color).toBe('black');
			expect(result.emptyWeight).toBe(0);
		});

		it('accepts optional descriptive fields', () => {
			// Arrange
			const {
				userId: _userId,
				containerId: _containerId,
				...input
			} = suitcaseFactory(
				'user-1',
				{
					brand: 'Samsonite',
					color: 'blue',
					features: [SuitcaseFeature.TSA_LOCK],
				},
				{ withDetails: true }
			);

			// Act
			const result = SuitcaseSchema.create.parse(input);

			// Assert
			expect(result.brand).toBe('Samsonite');
			expect(result.color).toBe('blue');
			expect(result.features).toEqual([SuitcaseFeature.TSA_LOCK]);
		});

		it('rejects input when required fields are missing', () => {
			// Arrange
			const {
				userId: _userId,
				containerId: _containerId,
				name: _name,
				...input
			} = suitcaseFactory('user-1');

			// Act & Assert
			expect(() => SuitcaseSchema.create.parse(input)).toThrow();
		});

		it('rejects invalid enum values', () => {
			// Arrange
			const {
				userId: _userId,
				containerId: _containerId,
				...input
			} = suitcaseFactory('user-1', {
				type: 'INVALID' as any,
			});

			// Act & Assert
			expect(() => SuitcaseSchema.create.parse(input)).toThrow();
		});

		it('rejects unknown fields', () => {
			// Arrange
			const {
				userId: _userId,
				containerId: _containerId,
				...input
			} = suitcaseFactory('user-1');

			// Act & Assert
			expect(() =>
				SuitcaseSchema.create.parse({
					...input,
					internalFlag: true,
				})
			).toThrow();
		});
	});

	describe('update', () => {
		it('accepts partial input', () => {
			// Arrange
			const input = {
				color: 'red',
				wheels: WheelType.TWO_WHEEL,
			};

			// Act
			const result = SuitcaseSchema.update.parse(input);

			// Assert
			expect(result.color).toBe('red');
			expect(result.wheels).toBe(WheelType.TWO_WHEEL);
		});

		it('applies default emptyWeight when not provided', () => {
			// Arrange
			const input = {};

			// Act
			const result = SuitcaseSchema.update.parse(input);

			// Assert
			expect(result.emptyWeight).toBe(0);
		});

		it('rejects invalid enum values', () => {
			// Arrange
			const input = {
				wheels: 'INVALID' as any,
			};

			// Act & Assert
			expect(() => SuitcaseSchema.update.parse(input)).toThrow();
		});

		it('rejects unknown fields', () => {
			// Arrange
			const input = {
				size: Size.LARGE,
				adminOverride: true,
			};

			// Act & Assert
			expect(() => SuitcaseSchema.update.parse(input)).toThrow();
		});
	});
});
