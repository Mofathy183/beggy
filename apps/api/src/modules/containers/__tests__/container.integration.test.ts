import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { faker } from '@faker-js/faker';
import { prisma } from '@prisma';
import { ErrorCode } from '@beggy/shared/constants';
import {
	BASE,
	createAnonAgent,
	createAuthenticatedAgent,
	expectError,
	seedTestPermissions,
	truncateAllTables,
	withCsrf,
} from '@tests';
import { containerFactory } from './factories/container.factory';
import { buildItem } from '@modules/items/__tests__/factories/item.factory';

describe('Containers Integration', () => {
	beforeAll(async () => {
		await seedTestPermissions();
	});

	beforeEach(async () => {
		await truncateAllTables();
	});

	afterAll(async () => {
		await prisma.$disconnect();
	});

	// Helper to create persisted container
	const createContainer = async (userId: string) => {
		return prisma.container.create({
			data: containerFactory(userId),
		});
	};

	const createItem = async (userId: string) => {
		const item = buildItem(userId);

		return prisma.item.create({
			data: item,
		});
	};

	describe('GET /containers/:id/state', () => {
		it('returns 200 with metrics and state for the container', async () => {
			// Arrange
			const { agent, userId } = await createAuthenticatedAgent();
			const container = await createContainer(userId);

			// Act
			const res = await agent.get(
				`${BASE}/containers/${container.id}/state`
			);

			// Assert
			expect(res.status).toBe(200);
			expect(res.body.data).toHaveProperty('metrics');
			expect(res.body.data).toHaveProperty('state');
		});

		it('returns 401 for unauthenticated requests', async () => {
			// Arrange
			const { agent } = await createAnonAgent();
			const containerId = faker.string.uuid();

			// Act
			const res = await agent.get(
				`${BASE}/containers/${containerId}/state`
			);

			// Assert
			expectError(res, 401);
		});

		it('returns 404 when the container does not exist', async () => {
			// Arrange
			const { agent } = await createAuthenticatedAgent();

			// Act
			const res = await agent.get(
				`${BASE}/containers/${faker.string.uuid()}/state`
			);

			// Assert
			expectError(res, 404, ErrorCode.CONTAINER_NOT_FOUND);
		});

		it('returns 404 when the container belongs to another user', async () => {
			// Arrange
			const userA = await createAuthenticatedAgent();
			const userB = await createAuthenticatedAgent();

			const container = await createContainer(userA.userId);

			// Act
			const res = await userB.agent.get(
				`${BASE}/containers/${container.id}/state`
			);

			// Assert
			expectError(res, 404, ErrorCode.CONTAINER_NOT_FOUND);
		});
	});

	describe('POST /containers/:id/pack', () => {
		it('returns 200 with container summary after packing item', async () => {
			// Arrange
			const { agent, csrfToken, userId } =
				await createAuthenticatedAgent();

			const container = await createContainer(userId);
			const item = await createItem(userId);

			const payload = {
				itemId: item.id,
				quantity: 2,
			};

			// Act
			const res = await withCsrf(
				agent
					.post(`${BASE}/containers/${container.id}/pack`)
					.send(payload),
				csrfToken
			);

			// Assert
			expect(res.status).toBe(200);
			expect(res.body.data.containerId).toBe(container.id);
			expect(res.body.data.status).toBeDefined();
		});

		it('returns 400 for invalid payload', async () => {
			// Arrange
			const { agent, csrfToken, userId } =
				await createAuthenticatedAgent();
			const container = await createContainer(userId);

			// Act
			const res = await withCsrf(
				agent.post(`${BASE}/containers/${container.id}/pack`).send({}),
				csrfToken
			);

			// Assert
			expectError(res, 400);
		});

		it('returns 404 when the container belongs to another user', async () => {
			// Arrange
			const userA = await createAuthenticatedAgent();
			const userB = await createAuthenticatedAgent();

			const container = await createContainer(userA.userId);
			const item = await createItem(userB.userId);

			// Act
			const res = await withCsrf(
				userB.agent
					.post(`${BASE}/containers/${container.id}/pack`)
					.send({ itemId: item.id, quantity: 1 }),
				userB.csrfToken
			);

			// Assert
			expectError(res, 404, ErrorCode.CONTAINER_NOT_FOUND);
		});
	});

	describe('POST /containers/:id/unpack', () => {
		it('returns 200 with container summary after unpacking item', async () => {
			// Arrange
			const { agent, csrfToken, userId } =
				await createAuthenticatedAgent();

			const container = await createContainer(userId);
			const item = await createItem(userId);

			// pre-pack
			await prisma.containerItems.create({
				data: {
					containerId: container.id,
					itemId: item.id,
					quantity: 3,
				},
			});

			// Act
			const res = await withCsrf(
				agent
					.post(`${BASE}/containers/${container.id}/unpack`)
					.send({ itemId: item.id, quantity: 1 }),
				csrfToken
			);

			// Assert
			expect(res.status).toBe(200);
			expect(res.body.data.containerId).toBe(container.id);
		});

		it('returns 404 when the item is not in the container', async () => {
			// Arrange
			const { agent, csrfToken, userId } =
				await createAuthenticatedAgent();
			const container = await createContainer(userId);

			// Act
			const res = await withCsrf(
				agent
					.post(`${BASE}/containers/${container.id}/unpack`)
					.send({ itemId: faker.string.uuid(), quantity: 1 }),
				csrfToken
			);

			// Assert
			expectError(res, 404, ErrorCode.CONTAINER_ITEM_NOT_FOUND);
		});

		it('returns 404 when the container belongs to another user', async () => {
			// Arrange
			const userA = await createAuthenticatedAgent();
			const userB = await createAuthenticatedAgent();

			const container = await createContainer(userA.userId);

			// Act
			const res = await withCsrf(
				userB.agent
					.post(`${BASE}/containers/${container.id}/unpack`)
					.send({ itemId: faker.string.uuid(), quantity: 1 }),
				userB.csrfToken
			);

			// Assert
			expectError(res, 404, ErrorCode.CONTAINER_NOT_FOUND);
		});
	});

	describe('POST /containers/move', () => {
		it('returns 200 with both container states after moving item', async () => {
			// Arrange
			const { agent, csrfToken, userId } =
				await createAuthenticatedAgent();

			const from = await createContainer(userId);
			const to = await createContainer(userId);
			const item = await createItem(userId);

			await prisma.containerItems.create({
				data: {
					containerId: from.id,
					itemId: item.id,
					quantity: 3,
				},
			});

			const payload = {
				fromContainerId: from.id,
				toContainerId: to.id,
				itemId: item.id,
				quantity: 2,
			};

			// Act
			const res = await withCsrf(
				agent.post(`${BASE}/containers/move`).send(payload),
				csrfToken
			);

			// Assert
			expect(res.status).toBe(200);
			expect(res.body.data.from.containerId).toBe(from.id);
			expect(res.body.data.to.containerId).toBe(to.id);
		});

		it('returns 400 for same source and destination containers', async () => {
			// Arrange
			const { agent, csrfToken, userId } =
				await createAuthenticatedAgent();
			const container = await createContainer(userId);

			const payload = {
				fromContainerId: container.id,
				toContainerId: container.id,
				itemId: faker.string.uuid(),
				quantity: 1,
			};

			// Act
			const res = await withCsrf(
				agent.post(`${BASE}/containers/move`).send(payload),
				csrfToken
			);

			// Assert
			expectError(res, 400);
		});

		it('returns 404 when the source container belongs to another user', async () => {
			// Arrange
			const userA = await createAuthenticatedAgent();
			const userB = await createAuthenticatedAgent();

			const from = await createContainer(userA.userId);
			const to = await createContainer(userB.userId);

			const payload = {
				fromContainerId: from.id,
				toContainerId: to.id,
				itemId: faker.string.uuid(),
				quantity: 1,
			};

			// Act
			const res = await withCsrf(
				userB.agent.post(`${BASE}/containers/move`).send(payload),
				userB.csrfToken
			);

			// Assert
			expectError(res, 404, ErrorCode.CONTAINER_NOT_FOUND);
		});
	});
});
