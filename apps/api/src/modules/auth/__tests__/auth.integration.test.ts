import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { prisma } from '@prisma';
import { ErrorCode } from '@beggy/shared/constants';
import {
	BASE,
	createAnonAgent,
	createAuthenticatedAgent,
	expectError,
	makeTestCredentials,
	seedTestPermissions,
	truncateAllTables,
	withCsrf,
} from '@tests';

describe('Auth Integration', () => {
	beforeAll(async () => {
		await seedTestPermissions();
	});

	beforeEach(async () => {
		await truncateAllTables();
	});

	afterAll(async () => {
		await prisma.$disconnect();
	});

	describe('GET /auth/csrf-token', () => {
		it('returns csrf token and sets cookie', async () => {
			const { agent } = await createAnonAgent();

			const res = await agent.get(`${BASE}/auth/csrf-token`);

			expect(res.status).toBe(200);
			expect(res.body.data.csrfToken).toBeDefined();
		});
	});

	describe('POST /auth/signup', () => {
		it('creates a user and returns 201', async () => {
			const { agent, csrfToken } = await createAnonAgent();

			const creds = makeTestCredentials();

			const res = await withCsrf(
				agent.post(`${BASE}/auth/signup`).send({
					firstName: creds.firstName,
					lastName: creds.lastName,
					email: creds.email,
					password: creds.password,
					confirmPassword: creds.password,
				}),
				csrfToken
			);

			expect(res.status).toBe(201);
		});

		it('returns 400 for invalid payload', async () => {
			const { agent, csrfToken } = await createAnonAgent();

			const res = await withCsrf(
				agent.post(`${BASE}/auth/signup`).send({}),
				csrfToken
			);

			expectError(res, 400);
		});
	});

	describe('POST /auth/login', () => {
		it('returns 200 when credentials are valid', async () => {
			const { agent, csrfToken } = await createAnonAgent();

			const password = 'Password123!';

			const creds = makeTestCredentials({ password });

			await withCsrf(
				agent.post(`${BASE}/auth/signup`).send({
					firstName: creds.firstName,
					lastName: creds.lastName,
					email: creds.email,
					password: creds.password,
					confirmPassword: creds.password,
				}),
				csrfToken
			);

			const res = await withCsrf(
				agent.post(`${BASE}/auth/login`).send({
					email: creds.email,
					password,
				}),
				csrfToken
			);

			expect(res.status).toBe(200);
		});

		it('returns 400 for invalid credentials', async () => {
			const { agent, csrfToken } = await createAnonAgent();

			const res = await withCsrf(
				agent.post(`${BASE}/auth/login`).send({
					email: 'wrong@email.com',
					password: 'WronG233@#!?',
				}),
				csrfToken
			);

			expectError(res, 400, ErrorCode.INVALID_CREDENTIALS);
		});
	});

	describe('GET /auth/me', () => {
		it('returns the authenticated user context', async () => {
			const { agent, userId } = await createAuthenticatedAgent();

			const res = await agent.get(`${BASE}/auth/me`);

			expect(res.status).toBe(200);

			expect(res.body.data.user.id).toBe(userId);
			expect(res.body.data).toHaveProperty('permissions');
			expect(res.body.data).toHaveProperty('auth');
		});

		it('returns 401 for unauthenticated requests', async () => {
			const { agent } = await createAnonAgent();

			const res = await agent.get(`${BASE}/auth/me`);

			expectError(res, 401);
		});
	});

	describe('DELETE /auth/logout', () => {
		it('logs out the user and returns 204', async () => {
			const { agent, csrfToken } = await createAuthenticatedAgent();

			const res = await withCsrf(
				agent.delete(`${BASE}/auth/logout`),
				csrfToken
			);

			expect(res.status).toBe(204);
		});

		it('returns 401 for unauthenticated requests', async () => {
			const { agent, csrfToken } = await createAnonAgent();

			const res = await withCsrf(
				agent.delete(`${BASE}/auth/logout`),
				csrfToken
			);

			expectError(res, 401);
		});
	});

	describe('POST /auth/refresh-token', () => {
		it('returns 200 and refreshes the access token', async () => {
			const { agent, csrfToken } = await createAuthenticatedAgent();

			const res = await withCsrf(
				agent.post(`${BASE}/auth/refresh-token`),
				csrfToken
			);

			expect(res.status).toBe(200);
		});

		it('returns 401 when no refresh token is provided', async () => {
			const { agent, csrfToken } = await createAnonAgent();

			const res = await withCsrf(
				agent.post(`${BASE}/auth/refresh-token`),
				csrfToken
			);

			expectError(res, 401);
		});
	});
});
