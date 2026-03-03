import { describe, it, expect, vi, beforeEach } from 'vitest';
import { faker } from '@faker-js/faker';
import { ItemService } from '../item.service';
import { ErrorCode } from '@beggy/shared/constants';

import { itemFactory, buildItem, buildItems } from './factories/item.factory';

import { buildItemQuery, buildMeta, appErrorMap } from '@shared/utils';
import type { CreateItemInput } from '@beggy/shared/types';

vi.mock('@shared/utils', async () => {
	return {
		buildItemQuery: vi.fn(),
		buildMeta: vi.fn(),
		appErrorMap: {
			notFound: vi.fn(),
		},
	};
});

const userId = 'user-1';

describe('ItemService', () => {
	let mockPrisma: any;
	let service: ItemService;

	beforeEach(() => {
		mockPrisma = {
			item: {
				findMany: vi.fn(),
				findUnique: vi.fn(),
				create: vi.fn(),
				update: vi.fn(),
				delete: vi.fn(),
			},
		};

		service = new ItemService(mockPrisma);
		vi.clearAllMocks();
	});

	describe('listItems()', () => {
		it('returns paginated items for user', async () => {
			/* Arrange */
			const userId = 'user-1';

			const pagination = { page: 1, limit: 10, offset: 0 };

			const items = buildItems(2, userId);

			(buildItemQuery as any).mockReturnValue({
				where: { category: 'CLOTHING' },
				orderBy: { createdAt: 'desc' },
			});

			(buildMeta as any).mockReturnValue({
				page: 1,
				limit: 10,
				total: 2,
				hasNextPage: false,
			});

			mockPrisma.item.findMany.mockResolvedValue(items);

			/* Act */
			const result = await service.listItems(
				userId,
				pagination,
				{} as any,
				{} as any
			);

			/* Assert */
			expect(buildItemQuery).toHaveBeenCalled();
			expect(mockPrisma.item.findMany).toHaveBeenCalledWith({
				where: {
					userId,
					category: 'CLOTHING',
				},
				orderBy: { createdAt: 'desc' },
				take: 10,
				skip: 0,
			});

			expect(buildMeta).toHaveBeenCalledWith(items, 10, 1);

			expect(result).toEqual({
				items,
				meta: {
					page: 1,
					limit: 10,
					total: 2,
					hasNextPage: false,
				},
			});
		});
	});

	describe('getItemById()', () => {
		it('returns item when found', async () => {
			/* Arrange */
			const item = buildItem(userId);

			mockPrisma.item.findUnique.mockResolvedValue(item);

			/* Act */
			const result = await service.getItemById(userId, item.id);

			/* Assert */
			expect(mockPrisma.item.findUnique).toHaveBeenCalledWith({
				where: { id: item.id, userId },
			});
			expect(result).toBe(item);
		});

		it('throws when item does not exist', async () => {
			/* Arrange */
			const userId = 'user-1';
			const error = new Error('not found');

			mockPrisma.item.findUnique.mockResolvedValue(null);
			(appErrorMap.notFound as any).mockReturnValue(error);

			/* Act + Assert */
			await expect(
				service.getItemById(userId, 'missing-id')
			).rejects.toThrow(error);

			expect(appErrorMap.notFound).toHaveBeenCalledWith(
				ErrorCode.ITEM_NOT_FOUND
			);
		});
	});

	describe('createItem()', () => {
		it('creates item with valid input', async () => {
			/* Arrange */
			const input = {
				...itemFactory(userId),
				quantity: faker.number.int({ min: 1, max: 10 }),
			};
			const createdItem = buildItem(userId);

			mockPrisma.item.create.mockResolvedValue(createdItem);

			/* Act */
			const result = await service.createItem(input as CreateItemInput);

			/* Assert */
			expect(mockPrisma.item.create).toHaveBeenCalledWith({
				data: input,
			});
			expect(result).toBe(createdItem);
		});
	});

	describe('updateItem()', () => {
		it('updates item with cleaned payload', async () => {
			/* Arrange */
			const item = buildItem(userId);

			const input = {
				name: 'Updated',
				description: null,
				weight: undefined,
			};

			mockPrisma.item.update.mockResolvedValue(item);

			/* Act */
			const result = await service.updateItem(
				userId,
				item.id,
				input as any
			);

			/* Assert */
			expect(mockPrisma.item.update).toHaveBeenCalledWith({
				where: { id: item.id, userId },
				data: { name: 'Updated' },
			});

			expect(result).toBe(item);
		});
	});

	describe('deleteItemById()', () => {
		it('deletes item when found', async () => {
			/* Arrange */
			const item = buildItem(userId);

			mockPrisma.item.delete.mockResolvedValue(item);

			/* Act */
			const result = await service.deleteItemById(userId, item.id);

			/* Assert */
			expect(mockPrisma.item.delete).toHaveBeenCalledWith({
				where: { id: item.id, userId },
			});
			expect(result).toBe(item);
		});
	});
});
