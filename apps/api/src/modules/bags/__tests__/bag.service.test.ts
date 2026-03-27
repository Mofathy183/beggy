import { describe, it, expect, vi, beforeEach } from 'vitest';
import { faker } from '@faker-js/faker';
import { bagFactory, buildBag, buildBags } from './factories/bag.factory';
import { BagService } from '../bag.service';
import { ErrorCode } from '@beggy/shared/constants';
import {
	UpdateBagInput,
	CreateBagInput,
	BagOrderByInput,
} from '@beggy/shared/types';

const mockPrisma = {
	bag: {
		findMany: vi.fn(),
		findUnique: vi.fn(),
		create: vi.fn(),
		update: vi.fn(),
		delete: vi.fn(),
	},
	container: {
		create: vi.fn(),
		update: vi.fn(),
	},
	$transaction: vi.fn(),
};

describe('BagService', () => {
	let service: BagService;
	const userId = faker.string.uuid();

	beforeEach(() => {
		vi.clearAllMocks();
		service = new BagService(mockPrisma as any);
	});

	describe('listBags()', () => {
		it('returns bags with pagination metadata', async () => {
			const bags = buildBags(1, userId);

			mockPrisma.bag.findMany.mockResolvedValue(bags);

			const pagination = { page: 1, limit: 10, offset: 0 };
			const result = await service.listBags(
				userId,
				pagination,
				{},
				{} as BagOrderByInput
			);

			expect(mockPrisma.bag.findMany).toHaveBeenCalledWith(
				expect.objectContaining({
					where: expect.objectContaining({ userId }),
					take: 11,
					skip: 0,
				})
			);
			expect(result.bags).toEqual(bags);
			expect(result.meta).toBeDefined();
		});

		it('returns an empty list when the user has no bags', async () => {
			mockPrisma.bag.findMany.mockResolvedValue([]);
			const pagination = { page: 1, limit: 10, offset: 0 };
			const result = await service.listBags(
				userId,
				pagination,
				{},
				{} as BagOrderByInput
			);
			expect(result.bags).toHaveLength(0);
		});
	});

	describe('getBagById()', () => {
		it('returns the bag when it exists', async () => {
			const bag = buildBag(userId);

			mockPrisma.bag.findUnique.mockResolvedValue(bag);

			const result = await service.getBagById(userId, bag.id);

			expect(result).toEqual(bag);

			expect(mockPrisma.bag.findUnique).toHaveBeenCalledWith(
				expect.objectContaining({
					where: { id: bag.id, userId },
				})
			);
		});

		it('throws when the bag does not exist', async () => {
			mockPrisma.bag.findUnique.mockResolvedValue(null);

			await expect(
				service.getBagById(userId, faker.string.uuid())
			).rejects.toMatchObject({
				code: ErrorCode.BAG_NOT_FOUND,
			});
		});

		it('throws when the bag belongs to another user', async () => {
			mockPrisma.bag.findUnique.mockResolvedValue(null);

			await expect(
				service.getBagById(userId, faker.string.uuid())
			).rejects.toMatchObject({
				code: ErrorCode.BAG_NOT_FOUND,
			});
		});
	});

	describe('createBag()', () => {
		it('creates a bag and its container and returns the persisted record', async () => {
			const input = bagFactory(userId, {
				name: 'Travel Backpack',
			});

			const createdBag = buildBag(userId, {
				name: input.name,
			});

			const containerId = createdBag.containerId;

			const containerCreate = vi
				.fn()
				.mockResolvedValue({ id: containerId });
			const bagCreate = vi.fn().mockResolvedValue(createdBag);

			mockPrisma.$transaction.mockImplementation(async (fn: any) => {
				return fn({
					container: { create: containerCreate },
					bag: { create: bagCreate },
				});
			});

			const result = await service.createBag(
				userId,
				input as CreateBagInput
			);

			expect(result).toEqual(createdBag);

			expect(containerCreate).toHaveBeenCalledWith(
				expect.objectContaining({
					data: expect.objectContaining({
						userId,
						maxCapacity: input.maxCapacity,
						maxWeight: input.maxWeight,
					}),
				})
			);

			expect(bagCreate).toHaveBeenCalledWith(
				expect.objectContaining({
					data: expect.objectContaining({
						name: input.name,
						containerId,
						userId,
					}),
				})
			);
		});
	});

	describe('updateBag()', () => {
		it('updates the bag and container fields and returns the updated record', async () => {
			const existing = buildBag(userId);

			const updated = buildBag(userId, {
				id: existing.id,
				name: 'Updated Name',
			});

			const containerUpdate = vi.fn();
			const bagUpdate = vi.fn().mockResolvedValue(updated);

			mockPrisma.bag.findUnique.mockResolvedValue(existing);

			mockPrisma.$transaction.mockImplementation(async (fn: any) => {
				return fn({
					container: { update: containerUpdate },
					bag: { update: bagUpdate },
				});
			});

			const result = await service.updateBag(userId, existing.id, {
				name: 'Updated Name',
				maxCapacity: 40,
			} as UpdateBagInput);

			expect(result).toEqual(updated);

			expect(containerUpdate).toHaveBeenCalledWith(
				expect.objectContaining({
					where: { id: existing.containerId },
					data: expect.objectContaining({
						maxCapacity: 40,
					}),
				})
			);

			expect(bagUpdate).toHaveBeenCalledWith(
				expect.objectContaining({
					where: { id: existing.id, userId },
					data: expect.objectContaining({
						name: 'Updated Name',
					}),
				})
			);
		});
	});

	describe('deleteBagById()', () => {
		it('deletes the bag', async () => {
			const bag = buildBag(userId);

			mockPrisma.bag.findUnique.mockResolvedValue(bag);
			mockPrisma.bag.delete.mockResolvedValue(bag);

			await expect(
				service.deleteBagById(userId, bag.id)
			).resolves.toBeUndefined();

			expect(mockPrisma.bag.delete).toHaveBeenCalledWith(
				expect.objectContaining({
					where: { id: bag.id, userId },
				})
			);
		});

		it('throws when the bag does not exist', async () => {
			mockPrisma.bag.findUnique.mockResolvedValue(null);

			await expect(
				service.deleteBagById(userId, faker.string.uuid())
			).rejects.toMatchObject({
				code: ErrorCode.BAG_NOT_FOUND,
			});
		});
	});
});
