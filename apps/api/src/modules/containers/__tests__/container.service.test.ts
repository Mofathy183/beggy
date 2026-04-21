import { describe, it, expect, vi, beforeEach } from 'vitest';
import { buildContainer } from './factories/container.factory';
import { buildItem } from '../../items/__tests__/factories/item.factory';
import { ContainerService } from '../container.service';

const createPrismaMock = () => ({
	container: {
		findUnique: vi.fn(),
	},
	item: {
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

	describe('packItem()', () => {
		it('creates or increments container item via upsert', async () => {
			// Arrange
			const container = buildContainer(userId);
			const item = buildItem(userId);

			mockPrisma.container.findUnique
				.mockResolvedValueOnce(container)
				.mockResolvedValueOnce(container);

			mockPrisma.item.findUnique.mockResolvedValue(item);

			// Act
			const result = await service.packItem(userId, container.id, {
				itemId: item.id,
				quantity: 2,
			});

			// Assert
			expect(result).toEqual(container);

			expect(mockPrisma.containerItems.upsert).toHaveBeenCalledWith({
				where: {
					containerId_itemId: {
						containerId: container.id,
						itemId: item.id,
					},
				},
				update: { quantity: { increment: 2 } },
				create: {
					containerId: container.id,
					itemId: item.id,
					quantity: 2,
				},
			});
		});

		it('throws when the container does not exist', async () => {
			mockPrisma.container.findUnique.mockResolvedValue(null);

			await expect(
				service.packItem(userId, 'missing-id', {
					itemId: 'item-1',
					quantity: 1,
				})
			).rejects.toThrow();
		});
	});

	describe('unpackItem()', () => {
		it('updates container item quantity when items remain', async () => {
			// Arrange
			const container = buildContainer(userId);
			const item = buildItem(userId);

			const txMock = {
				containerItems: {
					findUnique: vi.fn().mockResolvedValue({ quantity: 5 }),
					update: vi.fn(),
					delete: vi.fn(),
				},
			};

			mockPrisma.container.findUnique
				.mockResolvedValueOnce(container)
				.mockResolvedValueOnce(container);

			mockPrisma.item.findUnique.mockResolvedValue(item);

			mockPrisma.$transaction.mockImplementation(async (cb) =>
				cb(txMock)
			);

			// Act
			const result = await service.unpackItem(userId, container.id, {
				itemId: item.id,
				quantity: 2,
			});

			// Assert
			expect(result).toEqual(container);

			expect(txMock.containerItems.update).toHaveBeenCalledWith({
				where: {
					containerId_itemId: {
						containerId: container.id,
						itemId: item.id,
					},
				},
				data: { quantity: { decrement: 2 } },
			});
		});

		it('deletes container item when quantity reaches zero', async () => {
			// Arrange
			const container = buildContainer(userId);
			const item = buildItem(userId);

			const txMock = {
				containerItems: {
					findUnique: vi.fn().mockResolvedValue({ quantity: 2 }),
					update: vi.fn(),
					delete: vi.fn(),
				},
			};

			mockPrisma.container.findUnique
				.mockResolvedValueOnce(container)
				.mockResolvedValueOnce(container);

			mockPrisma.item.findUnique.mockResolvedValue(item);

			mockPrisma.$transaction.mockImplementation(async (cb) =>
				cb(txMock)
			);

			// Act
			await service.unpackItem(userId, container.id, {
				itemId: item.id,
				quantity: 2,
			});

			// Assert
			expect(txMock.containerItems.delete).toHaveBeenCalledWith({
				where: {
					containerId_itemId: {
						containerId: container.id,
						itemId: item.id,
					},
				},
			});
		});

		it('throws when the item does not exist', async () => {
			// Arrange
			const container = buildContainer(userId);

			mockPrisma.container.findUnique.mockResolvedValue(container);
			mockPrisma.item.findUnique.mockResolvedValue(null);

			// Act & Assert
			await expect(
				service.unpackItem(userId, container.id, {
					itemId: 'item-1',
					quantity: 1,
				})
			).rejects.toThrow();
		});
	});

	describe('moveItem()', () => {
		it('moves item inside a transaction', async () => {
			// Arrange
			const from = buildContainer(userId);
			const to = buildContainer(userId);
			const item = buildItem(userId);

			const txMock = {
				containerItems: {
					findUnique: vi.fn().mockResolvedValue({ quantity: 5 }),
					update: vi.fn(),
					upsert: vi.fn(),
					delete: vi.fn(),
				},
			};

			mockPrisma.item.findUnique.mockResolvedValue(item);

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
				itemId: item.id,
				quantity: 2,
			});

			// Assert
			expect(result.from).toEqual(from);
			expect(result.to).toEqual(to);

			expect(txMock.containerItems.update).toHaveBeenCalled();
			expect(txMock.containerItems.upsert).toHaveBeenCalled();
		});

		it('throws when the source item does not exist', async () => {
			// Arrange
			const from = buildContainer(userId);
			const to = buildContainer(userId);
			const item = buildItem(userId);

			mockPrisma.item.findUnique.mockResolvedValue(item);

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
					itemId: item.id,
					quantity: 1,
				})
			).rejects.toThrow();
		});
	});

	describe('getContainerState()', () => {
		it('returns the container state', async () => {
			const container = buildContainer(userId);

			mockPrisma.container.findUnique.mockResolvedValue(container);

			const result = await service.getContainerState(
				userId,
				container.id
			);

			expect(result).toEqual(container);
		});

		it('throws when the container does not exist', async () => {
			mockPrisma.container.findUnique.mockResolvedValue(null);

			await expect(
				service.getContainerState(userId, 'missing-id')
			).rejects.toThrow();
		});
	});
});
