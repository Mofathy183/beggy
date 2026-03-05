import request from 'supertest';
import express from 'express';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { createItemRouter } from '../item.route';
import { ItemController } from '../item.controller';

import type { ItemService } from '@modules/items';

import { buildItem, buildItems } from './factories/item.factory';
import { itemFactory } from './factories/item.factory';

vi.mock('@prisma/prisma.client', () => ({
	prisma: {
		item: {
			findMany: vi.fn(),
			findUnique: vi.fn(),
			create: vi.fn(),
			update: vi.fn(),
			delete: vi.fn(),
		},
	},
}));

vi.mock('@shared/middlewares', async () => {
	const actual = await vi.importActual<any>('@shared/middlewares');

	return {
		...actual,

		requireAuth: (req: any, _res: any, next: any) => {
			req.user = { id: 'user-1' };
			next();
		},

		requirePermission: () => (_req: any, _res: any, next: any) => next(),

		validateBody: () => (_req: any, _res: any, next: any) => next(),

		validateQuery: () => (_req: any, _res: any, next: any) => next(),

		validateUuidParam: (_req: any, _res: any, next: any) => next(),

		prepareListQuery: () => (req: any, _res: any, next: any) => {
			req.pagination = { page: 1, limit: 10, offset: 0 };
			req.orderBy = { field: 'createdAt', direction: 'desc' };
			next();
		},
	};
});

const userId = 'user-1';

const startApp = (service: ItemService) => {
	const controller = new ItemController(service);

	const app = express();
	app.use(express.json());
	app.use('/items', createItemRouter(controller));

	return app;
};

describe('Items API', () => {
	let service: ItemService;

	beforeEach(() => {
		service = {
			listItems: vi.fn(),
			getItemById: vi.fn(),
			createItem: vi.fn(),
			updateItem: vi.fn(),
			deleteItemById: vi.fn(),
		} as unknown as ItemService;
	});

	describe('GET /items', () => {
		it('returns paginated items for the authenticated user', async () => {
			const items = buildItems(2, userId);

			const meta = {
				page: 1,
				limit: 10,
				total: 2,
				hasNextPage: false,
			};

			(service.listItems as any).mockResolvedValue({
				items,
				meta,
			});

			const response = await request(startApp(service)).get('/items');

			expect(response.status).toBe(200);

			expect(service.listItems).toHaveBeenCalledTimes(1);

			expect(service.listItems).toHaveBeenCalledWith(
				userId,
				expect.any(Object),
				expect.any(Object),
				expect.any(Object)
			);
		});
	});

	describe('GET /items/:id', () => {
		it('returns the requested item', async () => {
			const item = buildItem(userId);

			(service.getItemById as any).mockResolvedValue(item);

			const response = await request(startApp(service)).get(
				`/items/${item.id}`
			);

			expect(response.status).toBe(200);

			expect(service.getItemById).toHaveBeenCalledTimes(1);

			expect(service.getItemById).toHaveBeenCalledWith(userId, item.id);
		});
	});

	describe('POST /items', () => {
		it('creates a new item', async () => {
			const input = itemFactory(userId);

			const createdItem = buildItem(userId);

			(service.createItem as any).mockResolvedValue(createdItem);

			const response = await request(startApp(service))
				.post('/items')
				.send(input);

			expect(response.status).toBe(201);

			expect(service.createItem).toHaveBeenCalledTimes(1);

			expect(service.createItem).toHaveBeenCalledWith(userId, input);
		});
	});

	describe('PATCH /items/:id', () => {
		it('updates the requested item', async () => {
			const item = buildItem(userId);

			const updateInput = {
				name: 'Updated Item',
			};

			const updatedItem = {
				...item,
				...updateInput,
			};

			(service.updateItem as any).mockResolvedValue(updatedItem);

			const response = await request(startApp(service))
				.patch(`/items/${item.id}`)
				.send(updateInput);

			expect(response.status).toBe(200);

			expect(service.updateItem).toHaveBeenCalledTimes(1);

			expect(service.updateItem).toHaveBeenCalledWith(
				userId,
				item.id,
				updateInput
			);
		});
	});

	describe('DELETE /items/:id', () => {
		it('deletes the requested item', async () => {
			const item = buildItem(userId);

			(service.deleteItemById as any).mockResolvedValue(item);

			const response = await request(startApp(service)).delete(
				`/items/${item.id}`
			);

			expect(response.status).toBe(204);

			expect(service.deleteItemById).toHaveBeenCalledTimes(1);

			expect(service.deleteItemById).toHaveBeenCalledWith(
				userId,
				item.id
			);
		});
	});
});
