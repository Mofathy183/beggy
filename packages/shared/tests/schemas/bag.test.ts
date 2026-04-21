import { describe, it, expect } from 'vitest';
import { BagSchema } from '../../src/schemas/bag.schema';
import { BagFeature } from '../../src/constants/bag.enums';
import { bagFactory } from '../factories/bag.factory';

describe('BagSchema', () => {
	describe('create', () => {
		it('accepts valid input', () => {
			// Arrange
			const {
				userId: _userId,
				containerId: _containerId,
				...input
			} = bagFactory('user-1');

			// Act
			const result = BagSchema.create.parse(input);

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
			} = bagFactory('user-1', {
				color: undefined,
				emptyWeight: undefined,
			});

			// Act
			const result = BagSchema.create.parse(input);

			// Assert
			expect(result.color).toBe('black');
			expect(result.emptyWeight).toBe(0);
		});

		it('accepts optional fields when provided', () => {
			// Arrange
			const {
				userId: _userId,
				containerId: _containerId,
				...input
			} = bagFactory(
				'user-1',
				{
					color: 'red',
					features: [BagFeature.WATERPROOF],
				},
				{ withDetails: true }
			);

			// Act
			const result = BagSchema.create.parse(input);

			// Assert
			expect(result.color).toBe('red');
			expect(result.features).toEqual([BagFeature.WATERPROOF]);
		});

		it('throws when required fields are missing', () => {
			// Arrange
			const {
				userId: _userId,
				containerId: _containerId,
				name: _name,
				...input
			} = bagFactory('user-1');

			// Act & Assert
			expect(() => BagSchema.create.parse(input)).toThrow();
		});

		it('throws when type is invalid', () => {
			// Arrange
			const {
				userId: _userId,
				containerId: _containerId,
				...input
			} = bagFactory('user-1');

			// Act & Assert
			expect(() =>
				BagSchema.create.parse({
					...input,
					type: 'INVALID_TYPE' as any,
				})
			).toThrow();
		});

		it('throws when feature is invalid', () => {
			// Arrange
			const {
				userId: _userId,
				containerId: _containerId,
				...input
			} = bagFactory('user-1', {
				features: ['INVALID_FEATURE'] as any,
			});

			// Act & Assert
			expect(() => BagSchema.create.parse(input)).toThrow();
		});

		it('throws when unknown fields are provided', () => {
			// Arrange
			const {
				userId: _userId,
				containerId: _containerId,
				...input
			} = bagFactory('user-1');

			// Act & Assert
			expect(() =>
				BagSchema.create.parse({
					...input,
					hacked: true,
				})
			).toThrow();
		});
	});

	describe('update', () => {
		it('accepts partial input', () => {
			// Arrange
			const input = {
				name: 'Updated Bag Name',
				maxWeight: 18,
			};

			// Act
			const result = BagSchema.update.parse(input);

			// Assert
			expect(result.name).toBe('Updated Bag Name');
			expect(result.maxWeight).toBe(18);
		});

		it('applies default emptyWeight when not provided', () => {
			// Arrange
			const input = {};

			// Act
			const result = BagSchema.update.parse(input);

			// Assert
			expect(result.emptyWeight).toBe(0);
		});

		it('applies default emptyWeight when value is undefined', () => {
			// Arrange
			const input = {
				emptyWeight: undefined,
			};

			// Act
			const result = BagSchema.update.parse(input);

			// Assert
			expect(result.emptyWeight).toBe(0);
		});

		it('throws when type is invalid', () => {
			// Arrange
			const input = {
				type: 'INVALID_TYPE',
			};

			// Act & Assert
			expect(() => BagSchema.update.parse(input)).toThrow();
		});

		it('throws when unknown fields are provided', () => {
			// Arrange
			const input = {
				color: 'blue',
				isAdminOnly: true,
			};

			// Act & Assert
			expect(() => BagSchema.update.parse(input)).toThrow();
		});
	});
});
