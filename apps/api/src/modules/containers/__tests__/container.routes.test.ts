import express, { Express } from 'express';
import request from 'supertest';
import { describe, it, expect, vi, beforeEach } from 'vitest';

// ---- Prisma mock (import-time safety) ----
vi.mock('@prisma/prisma.client', () => ({
	prisma: {
		container: {
			findUnique: vi.fn(),
		},
		containerItems: {
			upsert: vi.fn(),
			update: vi.fn(),
			delete: vi.fn(),
			findUnique: vi.fn(),
		},
	},
}));

// ---- Middleware mocks ----
vi.mock('@shared/middlewares', async () => {
	const actual = await vi.importActual<any>('@shared/middlewares');

	return {
		...actual,

		requireAuth: (req: any, _res: any, next: any) => {
			req.user = { id: 'user-123', role: 'USER' };
			next();
		},

		requirePermission: () => (_req: any, _res: any, next: any) => next(),

		validateBody: () => (_req: any, _res: any, next: any) => next(),

		validateUuidParam: (_req: any, _res: any, next: any) => next(),
	};
});

// ---- Imports ----
import {
	ContainerController,
	createContainerRouter,
} from '@modules/containers';

// ---- Factories ----
import { buildContainer } from './factories/container.factory';

// ---- Types ----
type MockedContainerService = {
	packItem: ReturnType<typeof vi.fn>;
	unpackItem: ReturnType<typeof vi.fn>;
	moveItem: ReturnType<typeof vi.fn>;
	getContainerState: ReturnType<typeof vi.fn>;
};

// ---- App Setup ----
const setupApp = (service: MockedContainerService): Express => {
	const app = express();
	app.use(express.json());

	const controller = new ContainerController(service as any);
	app.use('/containers', createContainerRouter(controller));

	return app;
};

describe('Containers Routes', () => {
	let service: MockedContainerService;

	beforeEach(() => {
		service = {
			packItem: vi.fn(),
			unpackItem: vi.fn(),
			moveItem: vi.fn(),
			getContainerState: vi.fn(),
		};
	});

	describe('POST /containers/:id/pack', () => {
		it('returns 200 with container summary after packing item', async () => {
			// Arrange
			const container = buildContainer('user-123');
			const payload = { itemId: 'item-1', quantity: 2 };

			service.packItem.mockResolvedValue(container);

			const app = setupApp(service);

			// Act
			const res = await request(app)
				.post(`/containers/${container.id}/pack`)
				.send(payload);

			// Assert
			expect(res.status).toBe(200);

			expect(res.body).toMatchObject({
				data: {
					containerId: container.id,
					status: expect.any(Object),
				},
			});

			expect(service.packItem).toHaveBeenCalledWith(
				'user-123',
				container.id,
				payload
			);
		});
	});

	describe('POST /containers/:id/unpack', () => {
		it('returns 200 with container summary after unpacking item', async () => {
			// Arrange
			const container = buildContainer('user-123');
			const payload = { itemId: 'item-1', quantity: 1 };

			service.unpackItem.mockResolvedValue(container);

			const app = setupApp(service);

			// Act
			const res = await request(app)
				.post(`/containers/${container.id}/unpack`)
				.send(payload);

			// Assert
			expect(res.status).toBe(200);

			expect(res.body).toMatchObject({
				data: {
					containerId: container.id,
					status: expect.any(Object),
				},
			});

			expect(service.unpackItem).toHaveBeenCalledWith(
				'user-123',
				container.id,
				payload
			);
		});
	});

	describe('POST /containers/move', () => {
		it('returns 200 with both containers after moving item', async () => {
			// Arrange
			const from = buildContainer('user-123');
			const to = buildContainer('user-123');

			const payload = {
				fromContainerId: from.id,
				toContainerId: to.id,
				itemId: 'item-1',
				quantity: 1,
			};

			service.moveItem.mockResolvedValue({ from, to });

			const app = setupApp(service);

			// Act
			const res = await request(app)
				.post('/containers/move')
				.send(payload);

			// Assert
			expect(res.status).toBe(200);

			expect(res.body).toMatchObject({
				data: {
					from: {
						containerId: from.id,
					},
					to: {
						containerId: to.id,
					},
				},
			});

			expect(service.moveItem).toHaveBeenCalledWith('user-123', payload);
		});
	});

	describe('GET /containers/:id/state', () => {
		it('returns 200 with container state', async () => {
			// Arrange
			const container = buildContainer('user-123');

			service.getContainerState.mockResolvedValue(container);

			const app = setupApp(service);

			// Act
			const res = await request(app).get(
				`/containers/${container.id}/state`
			);

			// Assert
			expect(res.status).toBe(200);

			expect(res.body).toMatchObject({
				data: {
					metrics: expect.any(Object),
					state: expect.any(Object),
				},
			});

			expect(service.getContainerState).toHaveBeenCalledWith(
				'user-123',
				container.id
			);
		});
	});
});
