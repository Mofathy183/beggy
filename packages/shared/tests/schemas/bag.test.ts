import { describe, it, expect } from 'vitest';
import { BagSchema } from '../../src/schemas/bag.schema';
import { BagFeature } from '../../src/constants/bag.enums';
import { bagFactory } from '../factories/bag.factory';

describe('BagSchema', () => {
	describe('create', () => {
		it('parses valid input', () => {
			// Arrange
			const { userId: _userId, ...input } = bagFactory('user-1');

			// Act
			const result = BagSchema.create.parse(input);

			// Assert
			expect(result).toMatchObject(input);
		});

		it('applies default values', () => {
			// Arrange
			const {
				userId: _userId,
				color,
				emptyWeight,
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

		it('parses optional fields when provided', () => {
			// Arrange
			const { userId: _userId, ...input } = bagFactory('user-1', {
				color: 'red',
				features: [BagFeature.WATERPROOF],
			});

			// Act
			const result = BagSchema.create.parse(input);

			// Assert
			expect(result.color).toBe('red');
			expect(result.features).toEqual([BagFeature.WATERPROOF]);
		});

		it('throws when unknown fields are provided', () => {
			// Arrange
			const { userId: _userId, ...input } = bagFactory('user-1');

			// Act & Assert
			expect(() =>
				BagSchema.create.parse({
					...input,
					hacked: true,
				})
			).toThrow();
		});

		it('throws when enum is invalid', () => {
			// Arrange
			const { userId: _userId, ...input } = bagFactory('user-1');

			// Act & Assert
			expect(() =>
				BagSchema.create.parse({
					...input,
					type: 'INVALID_TYPE',
				})
			).toThrow();
		});
	});

	describe('update', () => {
		it('parses partial update payloads', () => {
			// Arrange
			const input = {
				name: 'Updated Bag Name',
				maxWeight: 18,
			};

			// Act
			const result = BagSchema.update.parse(input);

			// Assert
			expect(result).toMatchObject(input);
		});

		it('returns defaulted fields when no input is provided', () => {
			// Act
			const result = BagSchema.update.parse({});

			// Assert
			expect(result).toEqual({
				emptyWeight: 0,
			});
		});

		it('applies default for emptyWeight when provided as undefined', () => {
			// Act
			const result = BagSchema.update.parse({
				emptyWeight: undefined,
			});

			// Assert
			expect(result.emptyWeight).toBe(0);
		});

		it('throws when unknown fields are provided', () => {
			// Act & Assert
			expect(() =>
				BagSchema.update.parse({
					color: 'blue',
					isAdminOnly: true,
				})
			).toThrow();
		});

		it('throws when enum is invalid', () => {
			// Act & Assert
			expect(() =>
				BagSchema.update.parse({
					type: 'INVALID_TYPE',
				})
			).toThrow();
		});
	});
});
