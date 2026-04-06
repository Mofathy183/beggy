import { describe, it, expect } from 'vitest';
import { ContainerSchema } from '../../src/schemas/container.schema';

describe('ContainerSchema.pack', () => {
	it('accepts valid input', () => {
		// Arrange
		const input = {
			itemId: crypto.randomUUID(),
			quantity: 2,
		};

		// Act
		const result = ContainerSchema.pack.parse(input);

		// Assert
		expect(result).toEqual(input);
	});

	it('rejects invalid itemId', () => {
		// Arrange
		const input = {
			itemId: 'invalid',
			quantity: 2,
		};

		// Act & Assert
		expect(() => ContainerSchema.pack.parse(input)).toThrow();
	});

	it('rejects non-positive quantity', () => {
		// Arrange
		const input = {
			itemId: crypto.randomUUID(),
			quantity: 0, // invalid (must be positive)
		};

		// Act & Assert
		expect(() => ContainerSchema.pack.parse(input)).toThrow();
	});

	it('rejects unknown fields', () => {
		// Arrange
		const input = {
			itemId: crypto.randomUUID(),
			quantity: 1,
			extra: 'not allowed',
		};

		// Act & Assert
		expect(() => ContainerSchema.pack.parse(input)).toThrow();
	});
});

describe('ContainerSchema.unpack', () => {
	it('accepts valid input', () => {
		// Arrange
		const input = {
			itemId: crypto.randomUUID(),
			quantity: 1,
		};

		// Act
		const result = ContainerSchema.unpack.parse(input);

		// Assert
		expect(result).toEqual(input);
	});

	it('rejects invalid itemId', () => {
		// Arrange
		const input = {
			itemId: 'invalid',
			quantity: 1,
		};

		// Act & Assert
		expect(() => ContainerSchema.unpack.parse(input)).toThrow();
	});

	it('rejects non-positive quantity', () => {
		// Arrange
		const input = {
			itemId: crypto.randomUUID(),
			quantity: -1,
		};

		// Act & Assert
		expect(() => ContainerSchema.unpack.parse(input)).toThrow();
	});

	it('rejects unknown fields', () => {
		// Arrange
		const input = {
			itemId: crypto.randomUUID(),
			quantity: 1,
			extra: true,
		};

		// Act & Assert
		expect(() => ContainerSchema.unpack.parse(input)).toThrow();
	});
});

describe('ContainerSchema.move', () => {
	it('accepts valid input', () => {
		// Arrange
		const input = {
			fromContainerId: crypto.randomUUID(),
			toContainerId: crypto.randomUUID(),
			itemId: crypto.randomUUID(),
			quantity: 3,
		};

		// Act
		const result = ContainerSchema.move.parse(input);

		// Assert
		expect(result).toEqual(input);
	});

	it('rejects invalid container ids', () => {
		// Arrange
		const input = {
			fromContainerId: 'invalid',
			toContainerId: 'invalid',
			itemId: crypto.randomUUID(),
			quantity: 1,
		};

		// Act & Assert
		expect(() => ContainerSchema.move.parse(input)).toThrow();
	});

	it('rejects when source and destination containers are the same', () => {
		// Arrange
		const sameId = crypto.randomUUID();

		const input = {
			fromContainerId: sameId,
			toContainerId: sameId,
			itemId: crypto.randomUUID(),
			quantity: 1,
		};

		// Act
		const { error } = ContainerSchema.move.safeParse(input);

		// Assert
		expect(error?.issues[0]?.path).toEqual(['toContainerId']);
		expect(error?.issues[0]?.message).toContain(
			"Looks like you're moving items to the same place"
		);
	});

	it('rejects unknown fields', () => {
		// Arrange
		const input = {
			fromContainerId: crypto.randomUUID(),
			toContainerId: crypto.randomUUID(),
			itemId: crypto.randomUUID(),
			quantity: 1,
			extra: 'not allowed',
		};

		// Act & Assert
		expect(() => ContainerSchema.move.parse(input)).toThrow();
	});
});
