import express, { Express, RequestHandler } from 'express';
import request from 'supertest';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import {
	type DashboardService,
	createDashboardRouter,
	DashboardController,
} from '@modules/dashboard';

import { buildDashboardOverview } from '../__tests__/factories/dashboard.factory';

vi.mock('@prisma/prisma.client', () => ({
	prisma: {
		profile: {
			findUnique: vi.fn(),
		},
		item: {
			aggregate: vi.fn(),
			findMany: vi.fn(),
			groupBy: vi.fn(),
			count: vi.fn(),
		},
	},
}));

let injectUser = true;

const passThrough: RequestHandler = (_req, _res, next) => next();

vi.mock('@shared/middlewares', async () => {
	const actual = await vi.importActual<any>('@shared/middlewares');

	return {
		...actual,
		requireAuth: (req: any, _res: any, next: any) => {
			if (injectUser) {
				req.user = { id: 'user-123', role: 'USER' };
			}
			next();
		},
		requirePermission: () => passThrough,
	};
});

const setupApp = (service: DashboardService): Express => {
	const app = express();
	app.use(express.json());

	const controller = new DashboardController(service);
	app.use('/dashboard', createDashboardRouter(controller));

	return app;
};

describe('GET /dashboard', () => {
	let service: DashboardService;

	beforeEach(() => {
		injectUser = true;

		service = {
			getDashboardOverview: vi.fn(),
		} as unknown as DashboardService;
	});

	it('returns dashboard overview for authenticated user', async () => {
		// Arrange
		const userId = 'user-123';

		const overview = buildDashboardOverview(
			userId,
			{},
			{
				withCategories: true,
			}
		);

		(service.getDashboardOverview as any).mockResolvedValue(overview);

		const app = setupApp(service);

		// Act
		const res = await request(app).get('/dashboard');

		// Assert
		expect(res.status).toBe(200);

		expect(res.body).toMatchObject({
			data: overview,
		});

		expect(service.getDashboardOverview).toHaveBeenCalledTimes(1);
		expect(service.getDashboardOverview).toHaveBeenCalledWith(userId);
	});

	it('rejects when user is not authenticated', async () => {
		// Arrange
		injectUser = false;

		const app = setupApp(service);

		// Act
		const res = await request(app).get('/dashboard');

		// Assert
		expect(res.status).toBe(401);

		expect(service.getDashboardOverview).not.toHaveBeenCalled();
	});

	it('returns server error when service fails', async () => {
		// Arrange
		const error = new Error('Something failed');

		(service.getDashboardOverview as any).mockRejectedValue(error);

		const app = setupApp(service);

		// Act
		const res = await request(app).get('/dashboard');

		// Assert
		expect(res.status).toBeGreaterThanOrEqual(500);

		expect(service.getDashboardOverview).toHaveBeenCalledTimes(1);
		expect(service.getDashboardOverview).toHaveBeenCalledWith('user-123');
	});

	it('returns overview without categories when categories are not provided', async () => {
		// Arrange
		const userId = 'user-123';

		const overview = buildDashboardOverview(
			userId,
			{},
			{ withCategories: false }
		);

		(service.getDashboardOverview as any).mockResolvedValue(overview);

		const app = setupApp(service);

		// Act
		const res = await request(app).get('/dashboard');

		// Assert
		expect(res.status).toBe(200);

		expect(res.body).toMatchObject({
			data: overview,
		});

		expect(res.body.data.items.categories).toBeUndefined();

		expect(service.getDashboardOverview).toHaveBeenCalledTimes(1);
		expect(service.getDashboardOverview).toHaveBeenCalledWith(userId);
	});

	it('calls service with authenticated user id', async () => {
		// Arrange
		const userId = 'user-123';

		const overview = buildDashboardOverview(userId);

		(service.getDashboardOverview as any).mockResolvedValue(overview);

		const app = setupApp(service);

		// Act
		await request(app).get('/dashboard');

		// Assert
		expect(service.getDashboardOverview).toHaveBeenCalledTimes(1);
		expect(service.getDashboardOverview).toHaveBeenCalledWith(userId);
	});
});
