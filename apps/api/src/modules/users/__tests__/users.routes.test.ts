import express from 'express';
import request from 'supertest';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { STATUS_CODE } from '@/shared/constants';
import {
	createUserRouter,
	UserController,
	type UserService,
} from '@modules/users';

import {
	userFactory,
	buildUser,
	buildUsers,
} from '@modules/users/__tests__/factories/user.factory';
import { profileFactory } from '@modules/profiles/__tests__/factories/profile.factory';

vi.mock('@prisma/prisma.client', () => ({
	prisma: {
		user: {
			findMany: vi.fn(),
			findUnique: vi.fn(),
			count: vi.fn(),
			create: vi.fn(),
			update: vi.fn(),
			delete: vi.fn(),
			deleteMany: vi.fn(),
		},
		profile: {
			create: vi.fn(),
			update: vi.fn(),
		},
		account: {
			create: vi.fn(),
		},
	},
}));

vi.mock('@shared/middlewares/auth.middleware', async () => {
	const actual = await vi.importActual<any>(
		'@shared/middlewares/auth.middleware'
	);
	const passThrough: express.RequestHandler = (_req, _res, next) => next();

	return {
		...actual,
		requireAuth: passThrough,
	};
});

vi.mock('@shared/middlewares/permission.middleware', async () => {
	const actual = await vi.importActual<any>(
		'@shared/middlewares/permission.middleware'
	);
	const passThrough: express.RequestHandler = (_req, _res, next) => next();

	return {
		...actual,
		requirePermission: () => passThrough,
	};
});

vi.mock('@shared/middlewares/validator.middleware', async () => {
	const actual = await vi.importActual<any>(
		'@shared/middlewares/validator.middleware'
	);
	const passThrough: express.RequestHandler = (_req, _res, next) => next();

	return {
		...actual,
		validateBody: () => passThrough,
		validateQuery: () => passThrough,
		validateUuidParam: passThrough,
	};
});

vi.mock('@shared/middlewares/query.middleware', async () => {
	const actual = await vi.importActual<any>(
		'@shared/middlewares/query.middleware'
	);

	return {
		...actual,
		prepareListQuery: () => {
			return (req: any, _res: any, next: any) => {
				req.pagination = { page: 1, limit: 10, offset: 0 };
				req.orderBy = undefined;
				next();
			};
		},
	};
});

const setupApp = (service: UserService) => {
	const app = express();
	app.use(express.json());

	const controller = new UserController(service);
	app.use('/users', createUserRouter(controller));

	return app;
};

describe('Users API', () => {
	let userService: UserService;

	beforeEach(() => {
		userService = {
			listUsers: vi.fn(),
			getById: vi.fn(),
			createUser: vi.fn(),
			updateProfile: vi.fn(),
			updateStatus: vi.fn(),
			changeRole: vi.fn(),
			deleteById: vi.fn(),
			deleteUsers: vi.fn(),
		} as unknown as UserService;
	});

	describe('GET /users', () => {
		it('returns a paginated list', async () => {
			// Arrange
			const users = buildUsers(2);
			const meta = { total: 2, page: 1, limit: 10 };

			(userService.listUsers as any).mockResolvedValue({ users, meta });

			const app = setupApp(userService);

			// Act
			const response = await request(app).get('/users');

			// Assert
			expect(response.status).toBe(STATUS_CODE.OK);
			expect(response.body).toMatchObject({
				data: expect.any(Array),
				meta,
			});

			expect(userService.listUsers).toHaveBeenCalledOnce();
			expect(userService.listUsers).toHaveBeenCalledWith(
				{ page: 1, limit: 10, offset: 0 },
				expect.any(Object),
				undefined
			);
		});
	});

	describe('GET /users/:id', () => {
		it('returns a user', async () => {
			// Arrange
			const user = buildUser();

			(userService.getById as any).mockResolvedValue(user);

			const app = setupApp(userService);

			// Act
			const response = await request(app).get(`/users/${user.id}`);

			// Assert
			expect(response.status).toBe(STATUS_CODE.OK);
			expect(response.body).toMatchObject({
				data: expect.any(Object),
			});

			expect(userService.getById).toHaveBeenCalledOnce();
			expect(userService.getById).toHaveBeenCalledWith(user.id);
		});
	});

	describe('POST /users', () => {
		it('creates a user', async () => {
			// Arrange
			const payload = userFactory();
			const createdUser = buildUser();

			(userService.createUser as any).mockResolvedValue(createdUser);

			const app = setupApp(userService);

			// Act
			const response = await request(app).post('/users').send(payload);

			// Assert
			expect(response.status).toBe(STATUS_CODE.CREATED);
			expect(response.body).toMatchObject({
				data: expect.any(Object),
			});

			expect(userService.createUser).toHaveBeenCalledOnce();
			expect(userService.createUser).toHaveBeenCalledWith(payload);
		});
	});

	describe('PATCH /users/:id/profile', () => {
		it('updates profile data', async () => {
			// Arrange
			const updatedUser = buildUser();
			const profilePayload = profileFactory(updatedUser.id);

			(userService.updateProfile as any).mockResolvedValue(updatedUser);

			const app = setupApp(userService);

			// Act
			const response = await request(app)
				.patch(`/users/${updatedUser.id}/profile`)
				.send(profilePayload);

			// Assert
			expect(response.status).toBe(STATUS_CODE.OK);

			expect(userService.updateProfile).toHaveBeenCalledOnce();
			expect(userService.updateProfile).toHaveBeenCalledWith(
				updatedUser.id,
				profilePayload
			);
		});
	});

	describe('PATCH /users/:id/status', () => {
		it('updates status', async () => {
			// Arrange
			const statusPayload = { isActive: false };
			const updatedUser = buildUser();

			(userService.updateStatus as any).mockResolvedValue(updatedUser);

			const app = setupApp(userService);

			// Act
			const response = await request(app)
				.patch(`/users/${updatedUser.id}/status`)
				.send(statusPayload);

			// Assert
			expect(response.status).toBe(STATUS_CODE.OK);

			expect(userService.updateStatus).toHaveBeenCalledOnce();
			expect(userService.updateStatus).toHaveBeenCalledWith(
				updatedUser.id,
				statusPayload
			);
		});
	});

	describe('PATCH /users/:id/role', () => {
		it('changes role', async () => {
			// Arrange
			const rolePayload = { role: 'ADMIN' };
			const updatedUser = buildUser();

			(userService.changeRole as any).mockResolvedValue(updatedUser);

			const app = setupApp(userService);

			// Act
			const response = await request(app)
				.patch(`/users/${updatedUser.id}/role`)
				.send(rolePayload);

			// Assert
			expect(response.status).toBe(STATUS_CODE.OK);

			expect(userService.changeRole).toHaveBeenCalledOnce();
			expect(userService.changeRole).toHaveBeenCalledWith(
				updatedUser.id,
				rolePayload
			);
		});
	});

	describe('DELETE /users/:id', () => {
		it('deletes a user', async () => {
			// Arrange
			const user = buildUser();

			(userService.deleteById as any).mockResolvedValue(undefined);

			const app = setupApp(userService);

			// Act
			const response = await request(app).delete(`/users/${user.id}`);

			// Assert
			expect(response.status).toBe(STATUS_CODE.NO_CONTENT);

			expect(userService.deleteById).toHaveBeenCalledOnce();
			expect(userService.deleteById).toHaveBeenCalledWith(user.id);
		});
	});

	describe('DELETE /users', () => {
		it('deletes users by filter', async () => {
			// Arrange
			(userService.deleteUsers as any).mockResolvedValue(undefined);

			const app = setupApp(userService);

			// Act
			const response = await request(app).delete('/users');

			// Assert
			expect(response.status).toBe(STATUS_CODE.NO_CONTENT);

			expect(userService.deleteUsers).toHaveBeenCalledOnce();
			expect(userService.deleteUsers).toHaveBeenCalledWith(
				expect.any(Object)
			);
		});
	});

	it('fails when an unexpected error occurs', async () => {
		(userService.getById as any).mockRejectedValue(new Error('boom'));

		const app = setupApp(userService);
		const res = await request(app).get('/users/123');

		expect(res.status).toBe(STATUS_CODE.INTERNAL_ERROR);
	});
});
