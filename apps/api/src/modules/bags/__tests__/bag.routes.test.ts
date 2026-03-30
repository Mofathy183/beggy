import express, { Express } from 'express';
import request from 'supertest';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { BagController, createBagRouter } from '@modules/bags';
import type { BagService } from '@modules/bags';

import { bagFactory, buildBag, buildBags } from './factories/bag.factory';

// ---- Prisma mock (import-time safety) ----
vi.mock('@prisma/prisma.client', () => ({
	prisma: {
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
	},
}));

// ---- Middleware mocks (pass-through) ----
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

// ---- Setup App ----
const setupApp = (service: BagService): Express => {
	const app = express();
	app.use(express.json());

	const controller = new BagController(service);
	app.use('/bags', createBagRouter(controller));

	return app;
};

describe('Bags Routes', () => {
	let service: BagService;
	beforeEach(() => {
		service = {
			listBags: vi.fn(),
			getBagById: vi.fn(),
			createBag: vi.fn(),
			updateBag: vi.fn(),
			deleteBagById: vi.fn(),
		} as unknown as BagService;
	});

	describe('GET /bags', () => {
		it('returns 200 with a list of bags', async () => {
			// Arrange
			const bags = buildBags(2, userId);

			(service.listBags as any).mockResolvedValue({
				bags,
				meta: { total: 2, page: 1, limit: 10 },
			});

			const app = setupApp(service);

			// Act
			const res = await request(app).get('/bags');

			// Assert
			expect(res.status).toBe(200);
			expect(res.body).toMatchObject({
				data: expect.any(Array),
				meta: { total: 2, page: 1, limit: 10 },
			});

			expect(service.listBags).toHaveBeenCalledWith(
				userId,
				{ page: 1, limit: 10, offset: 0 },
				{},
				{ field: 'createdAt', direction: 'desc' }
			);
		});
	});

	describe('GET /bags/:id', () => {
		it('returns 200 with the bag when id is valid', async () => {
			// Arrange
			const bag = buildBag(userId);

			(service.getBagById as any).mockResolvedValue(bag);

			const app = setupApp(service);

			// Act
			const res = await request(app).get(`/bags/${bag.id}`);

			// Assert
			expect(res.status).toBe(200);
			expect(res.body).toMatchObject({
				data: expect.any(Object),
			});

			expect(service.getBagById).toHaveBeenCalledWith(userId, bag.id);
		});
	});

	describe('POST /bags', () => {
		it('creates a bag and returns 201 with BagDTO', async () => {
			// Arrange
			const payload = bagFactory(userId);
			const bag = buildBag(userId, payload);

			(service.createBag as any).mockResolvedValue(bag);

			const app = setupApp(service);

			// Act
			const res = await request(app).post('/bags').send(payload);

			// Assert
			expect(res.status).toBe(201);
			expect(res.body).toMatchObject({
				data: expect.any(Object),
			});

			expect(service.createBag).toHaveBeenCalledWith(userId, payload);
		});
	});

	describe('PATCH /bags/:id', () => {
		it('updates the bag and returns 200 with the updated bag', async () => {
			// Arrange
			const payload = bagFactory(userId);
			const bag = buildBag(userId);

			(service.updateBag as any).mockResolvedValue(bag);

			const app = setupApp(service);

			// Act
			const res = await request(app)
				.patch(`/bags/${bag.id}`)
				.send(payload);

			// Assert
			expect(res.status).toBe(200);
			expect(res.body).toMatchObject({
				data: expect.any(Object),
			});

			expect(service.updateBag).toHaveBeenCalledWith(
				userId,
				bag.id,
				payload
			);
		});
	});

	describe('DELETE /bags/:id', () => {
		it('deletes the bag and returns 204', async () => {
			// Arrange
			const bag = buildBag(userId);

			(service.deleteBagById as any).mockResolvedValue(undefined);

			const app = setupApp(service);

			// Act
			const res = await request(app).delete(`/bags/${bag.id}`);

			// Assert
			expect(res.status).toBe(204);

			expect(service.deleteBagById).toHaveBeenCalledWith(userId, bag.id);
		});
	});
});
