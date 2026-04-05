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
	stripUserId,
	truncateAllTables,
	withCsrf,
} from '@tests';
import { itemFactory } from './factories/item.factory';

describe('Items Integration', () => {
	beforeAll(async () => {
		await seedTestPermissions();
	});

	beforeEach(async () => {
		await truncateAllTables();
	});

	afterAll(async () => {
		await prisma.$disconnect();
	});

	describe('POST /items', () => {
		it('creates an item and returns 201 with ItemDTO', async () => {
			// Arrange
			const { agent, csrfToken, userId } =
				await createAuthenticatedAgent();
			const payload = stripUserId(itemFactory(userId));

			// Act
			const res = await withCsrf(
				agent.post(`${BASE}/items`).send(payload),
				csrfToken
			);

			// Assert
			expect(res.status).toBe(201);
			expect(res.body.data).toMatchObject({
				...payload,
				userId,
			});
			expect(res.body.data.id).toBeDefined();
		});

		it('returns 400 for missing required fields', async () => {
			// Arrange
			const { agent, csrfToken } = await createAuthenticatedAgent();

			// Act
			const res = await withCsrf(
				agent.post(`${BASE}/items`).send({}),
				csrfToken
			);

			// Assert
			expectError(res, 400);
		});

		it('returns 401 for unauthenticated requests', async () => {
			// Arrange
			const { agent, csrfToken } = await createAnonAgent();
			const payload = stripUserId(itemFactory('ignored'));

			// Act
			const res = await withCsrf(
				agent.post(`${BASE}/items`).send(payload),
				csrfToken
			);

			// Assert
			expectError(res, 401);
		});

		it('allows moderator to create an item', async () => {
			// Arrange
			const { agent, csrfToken, role } = await createAuthenticatedAgent(
				undefined,
				Role.MODERATOR
			);

			const payload = stripUserId(itemFactory('ignored'));

			// Act
			const res = await withCsrf(
				agent.post(`${BASE}/items`).send(payload),
				csrfToken
			);

			// Assert
			expect(role).toBe(Role.MODERATOR);
			expect(res.status).toBe(201);
		});
	});

	describe('GET /items', () => {
		it('returns 200 with paginated items and metadata', async () => {
			// Arrange
			const { agent, csrfToken, userId } =
				await createAuthenticatedAgent();

			for (let i = 0; i < 3; i++) {
				await withCsrf(
					agent
						.post(`${BASE}/items`)
						.send(stripUserId(itemFactory(userId))),
					csrfToken
				);
			}

			// Act
			const res = await agent.get(`${BASE}/items`);

			// Assert
			expect(res.status).toBe(200);
			expectPaginatedResponse(res.body);
			expect(res.body.data.length).toBeGreaterThan(0);
		});

		it('returns 401 for unauthenticated requests', async () => {
			// Arrange
			const { agent } = await createAnonAgent();

			// Act
			const res = await agent.get(`${BASE}/items`);

			// Assert
			expectError(res, 401);
		});

		it('returns only items belonging to the authenticated user', async () => {
			// Arrange
			const userA = await createAuthenticatedAgent();
			const userB = await createAuthenticatedAgent();

			await withCsrf(
				userA.agent
					.post(`${BASE}/items`)
					.send(stripUserId(itemFactory(userA.userId))),
				userA.csrfToken
			);

			await withCsrf(
				userB.agent
					.post(`${BASE}/items`)
					.send(stripUserId(itemFactory(userB.userId))),
				userB.csrfToken
			);

			// Act
			const res = await userA.agent.get(`${BASE}/items`);

			// Assert
			expect(res.status).toBe(200);
			expect(
				res.body.data.every((i: any) => i.userId === userA.userId)
			).toBe(true);
		});
	});

	describe('GET /items/:id', () => {
		it('returns 200 with the item when it belongs to the authenticated user', async () => {
			// Arrange
			const { agent, csrfToken, userId } =
				await createAuthenticatedAgent();

			const createRes = await withCsrf(
				agent
					.post(`${BASE}/items`)
					.send(stripUserId(itemFactory(userId))),
				csrfToken
			);

			const itemId = createRes.body.data.id;

			// Act
			const res = await agent.get(`${BASE}/items/${itemId}`);

			// Assert
			expect(res.status).toBe(200);
			expect(res.body.data.userId).toBe(userId);
		});

		it('returns 404 when the item does not exist', async () => {
			// Arrange
			const { agent } = await createAuthenticatedAgent();

			// Act
			const res = await agent.get(`${BASE}/items/${faker.string.uuid()}`);

			// Assert
			expectError(res, 404, ErrorCode.ITEM_NOT_FOUND);
		});

		it('returns 404 when the item belongs to another user', async () => {
			// Arrange
			const userA = await createAuthenticatedAgent();
			const userB = await createAuthenticatedAgent();

			const createRes = await withCsrf(
				userA.agent
					.post(`${BASE}/items`)
					.send(stripUserId(itemFactory(userA.userId))),
				userA.csrfToken
			);

			const itemId = createRes.body.data.id;

			// Act
			const res = await userB.agent.get(`${BASE}/items/${itemId}`);

			// Assert
			expectError(res, 404, ErrorCode.ITEM_NOT_FOUND);
		});
	});

	describe('PATCH /items/:id', () => {
		it('updates the item and returns the updated ItemDTO', async () => {
			// Arrange
			const { agent, csrfToken, userId } =
				await createAuthenticatedAgent();

			const createRes = await withCsrf(
				agent
					.post(`${BASE}/items`)
					.send(stripUserId(itemFactory(userId))),
				csrfToken
			);

			const itemId = createRes.body.data.id;

			const updatePayload = {
				name: faker.word.words(2),
			};

			// Act
			const res = await withCsrf(
				agent.patch(`${BASE}/items/${itemId}`).send(updatePayload),
				csrfToken
			);

			// Assert
			expect(res.status).toBe(200);
			expect(res.body.data.name).toBe(updatePayload.name);
		});

		it('returns 404 when the item does not exist', async () => {
			// Arrange
			const { agent, csrfToken } = await createAuthenticatedAgent();

			// Act
			const res = await withCsrf(
				agent
					.patch(`${BASE}/items/${faker.string.uuid()}`)
					.send({ name: 'Updated' }),
				csrfToken
			);

			// Assert
			expectError(res, 404, ErrorCode.ITEM_NOT_FOUND);
		});

		it('returns 404 when the item belongs to another user', async () => {
			// Arrange
			const userA = await createAuthenticatedAgent();
			const userB = await createAuthenticatedAgent();

			const createRes = await withCsrf(
				userA.agent
					.post(`${BASE}/items`)
					.send(stripUserId(itemFactory(userA.userId))),
				userA.csrfToken
			);

			const itemId = createRes.body.data.id;

			// Act
			const res = await withCsrf(
				userB.agent
					.patch(`${BASE}/items/${itemId}`)
					.send({ name: 'Hacked' }),
				userB.csrfToken
			);

			// Assert
			expectError(res, 404, ErrorCode.ITEM_NOT_FOUND);
		});
	});

	describe('DELETE /items/:id', () => {
		it('deletes the item and returns 204', async () => {
			// Arrange
			const { agent, csrfToken, userId } =
				await createAuthenticatedAgent();

			const createRes = await withCsrf(
				agent
					.post(`${BASE}/items`)
					.send(stripUserId(itemFactory(userId))),
				csrfToken
			);

			const itemId = createRes.body.data.id;

			// Act
			const res = await withCsrf(
				agent.delete(`${BASE}/items/${itemId}`),
				csrfToken
			);

			// Assert
			expect(res.status).toBe(204);
		});

		it('returns 404 when the item does not exist', async () => {
			// Arrange
			const { agent, csrfToken } = await createAuthenticatedAgent();

			// Act
			const res = await withCsrf(
				agent.delete(`${BASE}/items/${faker.string.uuid()}`),
				csrfToken
			);

			// Assert
			expectError(res, 404, ErrorCode.ITEM_NOT_FOUND);
		});

		it('returns 404 when the item belongs to another user', async () => {
			// Arrange
			const userA = await createAuthenticatedAgent();
			const userB = await createAuthenticatedAgent();

			const createRes = await withCsrf(
				userA.agent
					.post(`${BASE}/items`)
					.send(stripUserId(itemFactory(userA.userId))),
				userA.csrfToken
			);

			const itemId = createRes.body.data.id;

			// Act
			const res = await withCsrf(
				userB.agent.delete(`${BASE}/items/${itemId}`),
				userB.csrfToken
			);

			// Assert
			expectError(res, 404, ErrorCode.ITEM_NOT_FOUND);
		});
	});
});
