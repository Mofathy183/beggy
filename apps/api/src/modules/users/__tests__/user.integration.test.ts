import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { faker } from '@faker-js/faker';
import { Role } from '@prisma-generated/enums';
import { prisma } from '@prisma';
import { ErrorCode } from '@beggy/shared/constants';
import {
	BASE,
	createAnonAgent,
	createAuthenticatedAgent,
	expectError,
	expectPaginatedResponse,
	seedTestPermissions,
	makeTestCredentials,
	truncateAllTables,
	withCsrf,
} from '@tests';

describe('Users Integration', () => {
	beforeAll(async () => {
		await seedTestPermissions();
	});

	beforeEach(async () => {
		await truncateAllTables();
	});

	afterAll(async () => {
		await prisma.$disconnect();
	});

	describe('GET /users', () => {
		it('returns 200 with paginated users and metadata', async () => {
			// Arrange
			const admin = await createAuthenticatedAgent(undefined, Role.ADMIN);

			const creds = makeTestCredentials();

			// create users via API
			for (let i = 0; i < 3; i++) {
				await withCsrf(
					admin.agent.post(`${BASE}/users`).send({
						firstName: creds.firstName,
						lastName: creds.lastName,
						email: creds.email,
						password: creds.password,
						confirmPassword: creds.password,
					}),
					admin.csrfToken
				);
			}

			// Act
			const res = await admin.agent.get(`${BASE}/users`);

			// Assert
			expect(res.status).toBe(200);
			expectPaginatedResponse(res.body);
		});

		it('returns 401 for unauthenticated requests', async () => {
			// Arrange
			const { agent } = await createAnonAgent();

			// Act
			const res = await agent.get(`${BASE}/users`);

			// Assert
			expectError(res, 401);
		});

		it('returns 403 for non-admin users', async () => {
			// Arrange
			const user = await createAuthenticatedAgent();

			// Act
			const res = await user.agent.get(`${BASE}/users`);

			console.log(res.body);

			// Assert
			expectError(res, 403);
		});
	});

	describe('GET /users/:id', () => {
		it('returns 200 with the user when it exists', async () => {
			// Arrange
			const admin = await createAuthenticatedAgent(undefined, Role.ADMIN);

			const creds = makeTestCredentials();

			const createRes = await withCsrf(
				admin.agent.post(`${BASE}/users`).send({
					firstName: creds.firstName,
					lastName: creds.lastName,
					email: creds.email,
					password: creds.password,
					confirmPassword: creds.password,
				}),
				admin.csrfToken
			);

			const userId = createRes.body.data.id;

			// Act
			const res = await admin.agent.get(`${BASE}/users/${userId}`);

			// Assert
			expect(res.status).toBe(200);
			expect(res.body.data.id).toBe(userId);
		});

		it('returns 404 when the user does not exist', async () => {
			// Arrange
			const admin = await createAuthenticatedAgent(undefined, Role.ADMIN);

			// Act
			const res = await admin.agent.get(
				`${BASE}/users/${faker.string.uuid()}`
			);

			// Assert
			expectError(res, 404, ErrorCode.USER_NOT_FOUND);
		});

		it('returns 403 for non-admin users', async () => {
			// Arrange
			const user = await createAuthenticatedAgent();

			// Act
			const res = await user.agent.get(
				`${BASE}/users/${faker.string.uuid()}`
			);

			// Assert
			expectError(res, 403);
		});
	});

	describe('POST /users', () => {
		it('creates a user and returns 201 with AdminUserDTO', async () => {
			// Arrange
			const admin = await createAuthenticatedAgent(undefined, Role.ADMIN);
			const creds = makeTestCredentials();

			// Act
			const res = await withCsrf(
				admin.agent.post(`${BASE}/users`).send({
					firstName: creds.firstName,
					lastName: creds.lastName,
					email: creds.email,
					password: creds.password,
					confirmPassword: creds.password,
				}),
				admin.csrfToken
			);

			// Assert
			expect(res.status).toBe(201);
			expect(res.body.data.email).toBe(creds.email.toLowerCase());
		});

		it('returns 401 for unauthenticated requests', async () => {
			const { agent, csrfToken } = await createAnonAgent();

			const creds = makeTestCredentials();

			const res = await withCsrf(
				agent.post(`${BASE}/users`).send({
					firstName: creds.firstName,
					lastName: creds.lastName,
					email: creds.email,
					password: creds.password,
					confirmPassword: creds.password,
				}),
				csrfToken
			);

			expectError(res, 401);
		});

		it('returns 403 for non-admin users', async () => {
			const user = await createAuthenticatedAgent();

			const creds = makeTestCredentials();

			const res = await withCsrf(
				user.agent.post(`${BASE}/users`).send({
					firstName: creds.firstName,
					lastName: creds.lastName,
					email: creds.email,
					password: creds.password,
					confirmPassword: creds.password,
				}),
				user.csrfToken
			);

			expectError(res, 403);
		});
	});

	describe('PATCH /users/:id/profile', () => {
		it('updates the user profile and returns ProfileDTO', async () => {
			// Arrange
			const admin = await createAuthenticatedAgent(undefined, Role.ADMIN);
			const creds = makeTestCredentials();

			const createRes = await withCsrf(
				admin.agent.post(`${BASE}/users`).send({
					firstName: creds.firstName,
					lastName: creds.lastName,
					email: creds.email,
					password: creds.password,
					confirmPassword: creds.password,
				}),
				admin.csrfToken
			);

			const userId = createRes.body.data.id;

			const payload = {
				firstName: faker.person.firstName(),
			};

			// Act
			const res = await withCsrf(
				admin.agent
					.patch(`${BASE}/users/${userId}/profile`)
					.send(payload),
				admin.csrfToken
			);

			// Assert
			expect(res.status).toBe(200);
			expect(res.body.data.firstName).toBe(payload.firstName);
		});

		it('returns 403 for non-admin users', async () => {
			const user = await createAuthenticatedAgent();

			const res = await withCsrf(
				user.agent
					.patch(`${BASE}/users/${faker.string.uuid()}/profile`)
					.send({ firstName: 'Test' }),
				user.csrfToken
			);

			expectError(res, 403);
		});
	});

	describe('PATCH /users/:id/status', () => {
		it('updates the user status and returns AdminUserDTO', async () => {
			const admin = await createAuthenticatedAgent(undefined, Role.ADMIN);
			const creds = makeTestCredentials();

			const createRes = await withCsrf(
				admin.agent.post(`${BASE}/users`).send({
					firstName: creds.firstName,
					lastName: creds.lastName,
					email: creds.email,
					password: creds.password,
					confirmPassword: creds.password,
				}),
				admin.csrfToken
			);

			const userId = createRes.body.data.id;

			const res = await withCsrf(
				admin.agent
					.patch(`${BASE}/users/${userId}/status`)
					.send({ isActive: false, isEmailVerified: true }),
				admin.csrfToken
			);

			expect(res.status).toBe(200);
			expect(res.body.data.isActive).toBe(false);
		});
	});

	describe('PATCH /users/:id/role', () => {
		it('updates the user role and returns AdminUserDTO', async () => {
			const admin = await createAuthenticatedAgent(undefined, Role.ADMIN);

			const creds = makeTestCredentials();

			const createRes = await withCsrf(
				admin.agent.post(`${BASE}/users`).send({
					firstName: creds.firstName,
					lastName: creds.lastName,
					email: creds.email,
					password: creds.password,
					confirmPassword: creds.password,
				}),
				admin.csrfToken
			);

			const userId = createRes.body.data.id;

			const res = await withCsrf(
				admin.agent
					.patch(`${BASE}/users/${userId}/role`)
					.send({ role: Role.MODERATOR }),
				admin.csrfToken
			);

			expect(res.status).toBe(200);
			expect(res.body.data.role).toBe(Role.MODERATOR);
		});
	});

	describe('DELETE /users/:id', () => {
		it('deletes the user and returns 204', async () => {
			const admin = await createAuthenticatedAgent(undefined, Role.ADMIN);

			const creds = makeTestCredentials();

			const createRes = await withCsrf(
				admin.agent.post(`${BASE}/users`).send({
					firstName: creds.firstName,
					lastName: creds.lastName,
					email: creds.email,
					password: creds.password,
					confirmPassword: creds.password,
				}),
				admin.csrfToken
			);

			const userId = createRes.body.data.id;

			const res = await withCsrf(
				admin.agent.delete(`${BASE}/users/${userId}`),
				admin.csrfToken
			);

			expect(res.status).toBe(204);
		});

		it('returns 404 when the user does not exist', async () => {
			const admin = await createAuthenticatedAgent(undefined, Role.ADMIN);

			const res = await withCsrf(
				admin.agent.delete(`${BASE}/users/${faker.string.uuid()}`),
				admin.csrfToken
			);

			expectError(res, 404, ErrorCode.USER_NOT_FOUND);
		});
	});

	describe('DELETE /users', () => {
		it('deletes users and returns 204', async () => {
			const admin = await createAuthenticatedAgent(undefined, Role.ADMIN);

			const creds = makeTestCredentials();

			await withCsrf(
				admin.agent.post(`${BASE}/users`).send({
					firstName: creds.firstName,
					lastName: creds.lastName,
					email: creds.email,
					password: creds.password,
					confirmPassword: creds.password,
				}),
				admin.csrfToken
			);

			const res = await withCsrf(
				admin.agent.delete(`${BASE}/users`),
				admin.csrfToken
			);

			expect(res.status).toBe(204);
		});

		it('returns 403 for non-admin users', async () => {
			const user = await createAuthenticatedAgent();

			const res = await withCsrf(
				user.agent.delete(`${BASE}/users`),
				user.csrfToken
			);

			expectError(res, 403);
		});
	});
});
