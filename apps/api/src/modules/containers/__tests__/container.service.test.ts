import { describe, it, expect, vi, beforeEach } from 'vitest';

import { buildContainer } from './factories/container.factory';

import { ContainerService } from '../container.service';

const createPrismaMock = () => ({
	container: {
		findUnique: vi.fn(),
	},
	containerItems: {
		findUnique: vi.fn(),
		upsert: vi.fn(),
		update: vi.fn(),
		delete: vi.fn(),
	},
	$transaction: vi.fn(),
});

describe('ContainerService', () => {
	let service: ContainerService;
	let mockPrisma: ReturnType<typeof createPrismaMock>;

	const userId = 'user-1';

	beforeEach(() => {
		mockPrisma = createPrismaMock();
		service = new ContainerService(mockPrisma as any);
	});

	describe('packItem', () => {
		it('upserts item by creating or incrementing quantity', async () => {
			// Arrange
			const container = buildContainer(userId);

			mockPrisma.container.findUnique
				.mockResolvedValueOnce(container)
				.mockResolvedValueOnce(container);

			// Act
			const result = await service.packItem(userId, container.id, {
				itemId: 'item-1',
				quantity: 2,
			});

			// Assert
			expect(result).toEqual(container);

			expect(mockPrisma.containerItems.upsert).toHaveBeenCalledWith(
				expect.objectContaining({
					where: {
						containerId_itemId: {
							containerId: container.id,
							itemId: 'item-1',
						},
					},
					update: { quantity: { increment: 2 } },
					create: {
						containerId: container.id,
						itemId: 'item-1',
						quantity: 2,
					},
				})
			);

			expect(mockPrisma.container.findUnique).toHaveBeenCalledTimes(2);
		});
	});

	describe('unpackItem', () => {
		it('decrements quantity when items remain', async () => {
			// Arrange
			const container = buildContainer(userId);

			mockPrisma.container.findUnique
				.mockResolvedValueOnce(container)
				.mockResolvedValueOnce(container);

			mockPrisma.containerItems.findUnique.mockResolvedValue({
				quantity: 5,
			});

			// Act
			const result = await service.unpackItem(userId, container.id, {
				itemId: 'item-1',
				quantity: 2,
			});

			// Assert
			expect(result).toEqual(container);

			expect(mockPrisma.containerItems.update).toHaveBeenCalledWith(
				expect.objectContaining({
					data: { quantity: { decrement: 2 } },
				})
			);
		});

		it('deletes item when quantity reaches zero', async () => {
			// Arrange
			const container = buildContainer(userId);

			mockPrisma.container.findUnique
				.mockResolvedValueOnce(container)
				.mockResolvedValueOnce(container);

			mockPrisma.containerItems.findUnique.mockResolvedValue({
				quantity: 2,
			});

			// Act
			await service.unpackItem(userId, container.id, {
				itemId: 'item-1',
				quantity: 2,
			});

			// Assert
			expect(mockPrisma.containerItems.delete).toHaveBeenCalledTimes(1);
		});

		it('throws when item does not exist', async () => {
			// Arrange
			const container = buildContainer(userId);

			mockPrisma.container.findUnique.mockResolvedValue(container);
			mockPrisma.containerItems.findUnique.mockResolvedValue(null);

			// Act & Assert
			await expect(
				service.unpackItem(userId, container.id, {
					itemId: 'item-1',
					quantity: 1,
				})
			).rejects.toThrow();
		});
	});

	describe('moveItem', () => {
		it('moves item between containers inside a transaction', async () => {
			// Arrange
			const from = buildContainer(userId);
			const to = buildContainer(userId);

			const txMock = {
				containerItems: {
					findUnique: vi.fn().mockResolvedValue({ quantity: 5 }),
					update: vi.fn(),
					upsert: vi.fn(),
				},
			};

			mockPrisma.container.findUnique
				.mockResolvedValueOnce(from)
				.mockResolvedValueOnce(to)
				.mockResolvedValueOnce(from)
				.mockResolvedValueOnce(to);

			mockPrisma.$transaction.mockImplementation(async (cb) =>
				cb(txMock)
			);

			// Act
			const result = await service.moveItem(userId, {
				fromContainerId: from.id,
				toContainerId: to.id,
				itemId: 'item-1',
				quantity: 2,
			});

			// Assert
			expect(result.from).toEqual(from);
			expect(result.to).toEqual(to);

			expect(mockPrisma.$transaction).toHaveBeenCalledTimes(1);
			expect(txMock.containerItems.upsert).toHaveBeenCalled();
		});

		it('throws when source item does not exist', async () => {
			// Arrange
			const from = buildContainer(userId);
			const to = buildContainer(userId);

			const txMock = {
				containerItems: {
					findUnique: vi.fn().mockResolvedValue(null),
				},
			};

			mockPrisma.container.findUnique
				.mockResolvedValueOnce(from)
				.mockResolvedValueOnce(to);

			mockPrisma.$transaction.mockImplementation(async (cb) =>
				cb(txMock)
			);

			// Act & Assert
			await expect(
				service.moveItem(userId, {
					fromContainerId: from.id,
					toContainerId: to.id,
					itemId: 'item-1',
					quantity: 1,
				})
			).rejects.toThrow();
		});
	});

	describe('getContainerState', () => {
		it('returns the container when it exists', async () => {
			// Arrange
			const container = buildContainer(userId);

			mockPrisma.container.findUnique.mockResolvedValue(container);

			// Act
			const result = await service.getContainerState(
				userId,
				container.id
			);

			// Assert
			expect(result).toEqual(container);
		});
	});
});
