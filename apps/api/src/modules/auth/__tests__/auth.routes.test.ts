import express, { type Express } from 'express';
import request from 'supertest';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import {
	createAuthRouter,
	AuthController,
	type AuthService,
} from '@modules/auth';
import { type UserService } from '@modules/users';

import {
	userFactory,
	buildUser,
} from '@modules/users/__tests__/factories/user.factory';

import { STATUS_CODE } from '@shared/constants';
import { env } from '@/config';
import { RolePermissions } from '@beggy/shared/constants';

// ---- Prisma mock (import-time safety) ----
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

let injectUser = true;

// ---- Middleware pass-through mocks ----
vi.mock('@shared/middlewares/auth.middleware', async () => {
	const actual = await vi.importActual<any>(
		'@shared/middlewares/auth.middleware'
	);

	const requireAuthMock: express.RequestHandler = (req: any, _res, next) => {
		if (injectUser) {
			req.user = {
				id: 'user-123',
				role: 'USER',
				issuedAt: Date.now(),
			};
		}

		// required for requirePermission (even if mocked)
		req.ability = {
			can: () => true,
			cannot: () => false,
		};

		next();
	};

	const requireRefreshTokenMock: express.RequestHandler = (
		req: any,
		_res,
		next
	) => {
		req.refreshPayload = { userId: 'user-123' };
		next();
	};

	return {
		...actual,
		requireAuth: requireAuthMock,
		requireRefreshToken: requireRefreshTokenMock,
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
	};
});

const setupApp = (
	authService: AuthService,
	userService: UserService,
	withAuthUser = false
): Express => {
	const app = express();
	app.use(express.json());

	app.use((req: any, _res, next) => {
		req.cookies = {
			[env.CSRF_COOKIE_NAME]: 'fake-csrf-cookie',
			[env.JWT_REFRESH_TOKEN_NAME]: 'fake-refresh-token',
		};
		next();
	});

	app.use((req: any, _res, next) => {
		req.authTokens = {
			accessToken: 'fake-access-token',
			refreshToken: 'fake-refresh-token',
		};
		next();
	});

	if (withAuthUser) {
		app.use((req: any, _res, next) => {
			req.user = { id: 'user-123' };
			next();
		});
	}

	const controller = new AuthController(authService, userService);
	app.use('/auth', createAuthRouter(controller));

	return app;
};

describe('Auth API', () => {
	let authService: AuthService;
	let userService: UserService;

	beforeEach(() => {
		injectUser = true;
		authService = {
			signupUser: vi.fn(),
			loginUser: vi.fn(),
			authUser: vi.fn(),
		} as unknown as AuthService;

		userService = {
			getById: vi.fn(),
		} as unknown as UserService;
	});

	describe('POST /auth/signup', () => {
		it('creates a new user and establishes a session', async () => {
			// Arrange
			const payload = userFactory();
			const user = buildUser();

			(authService.signupUser as any).mockResolvedValue({
				id: user.id,
				role: user.role,
			});

			const app = setupApp(authService, userService);

			// Act
			const response = await request(app)
				.post('/auth/signup')
				.send(payload);

			// Assert
			expect(response.status).toBe(STATUS_CODE.CREATED);
			expect(response.body).toMatchObject({ data: null });

			expect(authService.signupUser).toHaveBeenCalledOnce();
			expect(authService.signupUser).toHaveBeenCalledWith(payload);
		});
	});

	describe('POST /auth/login', () => {
		it('authenticates a user and issues session cookies', async () => {
			// Arrange
			const input = {
				email: 'user@test.com',
				password: 'password123',
				rememberMe: true,
			};

			const user = buildUser();

			(authService.loginUser as any).mockResolvedValue({
				id: user.id,
				role: user.role,
			});

			const app = setupApp(authService, userService);

			// Act
			const response = await request(app).post('/auth/login').send(input);

			// Assert
			expect(response.status).toBe(STATUS_CODE.OK);
			expect(response.body).toMatchObject({ data: null });

			expect(authService.loginUser).toHaveBeenCalledOnce();
			expect(authService.loginUser).toHaveBeenCalledWith(input);
		});
	});

	describe('DELETE /auth/logout', () => {
		it('clears authentication cookies', async () => {
			// Arrange
			const app = setupApp(authService, userService, true);

			// Act
			const response = await request(app).delete('/auth/logout');

			// Assert
			expect(response.status).toBe(STATUS_CODE.NO_CONTENT);
		});
	});

	describe('POST /auth/refresh-token', () => {
		it('issues a new access token when refresh token is valid', async () => {
			const user = {
				id: 'user-123',
				...userFactory(),
			};

			(userService.getById as any).mockResolvedValue(user);

			const app = setupApp(authService, userService, true);

			const response = await request(app).post('/auth/refresh-token');

			expect(response.status).toBe(STATUS_CODE.OK);
			expect(response.body).toMatchObject({
				data: null,
			});

			expect(userService.getById).toHaveBeenCalledWith('user-123');
		});
	});

	describe('GET /auth/csrf-token', () => {
		it('returns a csrf token', async () => {
			// Arrange
			const app = setupApp(authService, userService);

			// Act
			const response = await request(app).get('/auth/csrf-token');

			// Assert
			expect(response.status).toBe(STATUS_CODE.OK);
			expect(response.body).toMatchObject({
				data: {
					csrfToken: expect.any(String),
				},
			});
		});
	});

	describe('GET /auth/me', () => {
		it('returns authenticated user and permissions', async () => {
			// Arrange
			const { id, ...userData } = buildUser({ role: 'USER' });
			const user = {
				id: 'user-123',
				...userData,
				account: [{ authProvider: 'LOCAL' }],
			};

			const permissions = RolePermissions[user.role] ?? [];

			const app = setupApp(authService, userService);

			(authService.authUser as any).mockResolvedValue({
				user,
				permissions,
			});

			// Act
			const response = await request(app).get('/auth/me');

			expect(response.status).toBe(STATUS_CODE.OK);
			// Assert
			expect(response.body).toMatchObject({
				data: {
					user: {
						id: user.id,
						email: user.email,
						role: user.role,
					},
					permissions,
				},
			});

			expect(authService.authUser).toHaveBeenCalledTimes(1);
			expect(authService.authUser).toHaveBeenCalledWith('user-123');
		});

		it('throws unauthorized when user context is missing', async () => {
			// Arrange
			injectUser = false; // 👈 simulate broken auth context

			const app = setupApp(authService, userService);

			// Act
			const response = await request(app).get('/auth/me');

			// Assert
			expect(response.status).toBe(STATUS_CODE.UNAUTHORIZED);
		});

		it('propagates errors from auth service', async () => {
			// Arrange
			(authService.authUser as any).mockRejectedValue(
				new Error('Auth service failed')
			);

			const app = setupApp(authService, userService);

			// Act
			const response = await request(app).get('/auth/me');

			// Assert
			expect(response.status).toBe(STATUS_CODE.INTERNAL_ERROR);
			expect(authService.authUser).toHaveBeenCalledOnce();
		});

		it('returns permissions derived from user role', async () => {
			// Arrange
			const { id, ...userData } = buildUser({ role: 'ADMIN' });

			const user = {
				id: 'user-123',
				...userData,
				account: [{ authProvider: 'LOCAL' }],
			};

			const permissions = RolePermissions.ADMIN;

			(authService.authUser as any).mockResolvedValue({
				user,
				permissions,
			});

			const app = setupApp(authService, userService);

			// Act
			const response = await request(app).get('/auth/me');

			// Assert
			expect(response.status).toBe(STATUS_CODE.OK);
			expect(response.body.data.permissions).toEqual(permissions);
		});
	});
});
