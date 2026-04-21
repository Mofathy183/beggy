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
import { buildItem } from '@modules/items/__tests__/factories/item.factory';
import { bagFactory } from '@modules/bags/__tests__/factories/bag.factory';

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

	// ✅ Minimal persisted helpers (NOT factories)
	const createContainer = async (userId: string) => {
		return prisma.container.create({
			data: {
				userId,
				type: 'BAG',
				maxCapacity: 50,
				maxWeight: 20,
				emptyWeight: 2,
			},
		});
	};

	const createItem = async (userId: string) => {
		const item = buildItem(userId);

		return prisma.item.create({ data: item });
	};

	const createBag = async (userId: string, containerId: string) => {
		const { maxCapacity, maxWeight, emptyWeight, ...bagInput } =
			bagFactory(userId);

		const bag = { ...bagInput, containerId };

		// IMPORTANT: bag must exist for BAG container
		await prisma.bag.create({
			data: bag,
		});
	};

	describe('GET /containers/:id', () => {
		it('returns 200 with BAG typed container and BagDTO', async () => {
			// Arrange
			const { agent, userId } = await createAuthenticatedAgent();

			const container = await prisma.container.create({
				data: {
					userId,
					type: 'BAG',
					maxCapacity: 50,
					maxWeight: 20,
					emptyWeight: 2,
				},
			});

			await createBag(userId, container.id);

			// Act
			const res = await agent.get(`${BASE}/containers/${container.id}`);

			// Assert
			expect(res.status).toBe(200);

			expect(res.body.data).toMatchObject({
				type: 'BAG',
				data: {
					containerId: container.id,
				},
			});
		});

		it('returns 401 for unauthenticated requests', async () => {
			// Arrange
			const { agent } = await createAnonAgent();

			// Act
			const res = await agent.get(
				`${BASE}/containers/${faker.string.uuid()}`
			);

			// Assert
			expectError(res, 401);
		});

		it('returns 404 for a non-existent container', async () => {
			// Arrange
			const { agent } = await createAuthenticatedAgent();

			// Act
			const res = await agent.get(
				`${BASE}/containers/${faker.string.uuid()}`
			);

			// Assert
			expectError(res, 404, ErrorCode.CONTAINER_NOT_FOUND);
		});

		it('returns 404 when the container belongs to another user', async () => {
			// Arrange
			const userA = await createAuthenticatedAgent();
			const userB = await createAuthenticatedAgent();

			const container = await prisma.container.create({
				data: {
					userId: userA.userId,
					type: 'BAG',
					maxCapacity: 50,
					maxWeight: 20,
					emptyWeight: 2,
				},
			});

			await createBag(userA.userId, container.id);

			// Act
			const res = await userB.agent.get(
				`${BASE}/containers/${container.id}`
			);

			// Assert
			expectError(res, 404, ErrorCode.CONTAINER_NOT_FOUND);
		});

		it('returns 404 when BAG container exists without bag record', async () => {
			// Arrange
			const { agent, userId } = await createAuthenticatedAgent();

			const container = await prisma.container.create({
				data: {
					userId,
					type: 'BAG',
					maxCapacity: 50,
					maxWeight: 20,
					emptyWeight: 2,
				},
			});

			// Act
			const res = await agent.get(`${BASE}/containers/${container.id}`);

			// Assert
			expectError(res, 404, ErrorCode.BAG_NOT_FOUND);
		});
	});

	describe('GET /containers/:id/state', () => {
		it('returns 200 with ContainerStateDTO', async () => {
			// Arrange
			const { agent, userId } = await createAuthenticatedAgent();
			const container = await createContainer(userId);

			// Act
			const res = await agent.get(
				`${BASE}/containers/${container.id}/state`
			);

			// Assert
			expect(res.status).toBe(200);
			expect(res.body.data).toMatchObject({
				containerId: container.id,
				items: [],
				status: {
					metrics: expect.any(Object),
					state: expect.any(Object),
				},
			});
		});

		it('returns 401 for unauthenticated requests', async () => {
			const { agent } = await createAnonAgent();

			const res = await agent.get(
				`${BASE}/containers/${faker.string.uuid()}/state`
			);

			expectError(res, 401);
		});

		it('returns 404 when the container does not exist', async () => {
			const { agent } = await createAuthenticatedAgent();

			const res = await agent.get(
				`${BASE}/containers/${faker.string.uuid()}/state`
			);

			expectError(res, 404, ErrorCode.CONTAINER_NOT_FOUND);
		});

		it('returns 404 when the container belongs to another user', async () => {
			const userA = await createAuthenticatedAgent();
			const userB = await createAuthenticatedAgent();

			const container = await createContainer(userA.userId);

			const res = await userB.agent.get(
				`${BASE}/containers/${container.id}/state`
			);

			expectError(res, 404, ErrorCode.CONTAINER_NOT_FOUND);
		});
	});

	describe('POST /containers/:id/pack', () => {
		it('updates container item quantity after packing item', async () => {
			// Arrange
			const { agent, csrfToken, userId } =
				await createAuthenticatedAgent();
			const container = await createContainer(userId);
			const item = await createItem(userId);

			// Act
			const res = await withCsrf(
				agent
					.post(`${BASE}/containers/${container.id}/pack`)
					.send({ itemId: item.id, quantity: 2 }),
				csrfToken
			);

			// Assert HTTP
			expect(res.status).toBe(200);
			expect(res.body.data.containerId).toBe(container.id);

			// Assert DB
			const record = await prisma.containerItems.findUnique({
				where: {
					containerId_itemId: {
						containerId: container.id,
						itemId: item.id,
					},
				},
			});

			expect(record?.quantity).toBe(2);
		});

		it('returns 401 for unauthenticated requests', async () => {
			const { agent, csrfToken } = await createAnonAgent();

			const res = await withCsrf(
				agent
					.post(`${BASE}/containers/${faker.string.uuid()}/pack`)
					.send({}),
				csrfToken
			);

			expectError(res, 401);
		});

		it('returns 404 when item belongs to another user', async () => {
			const userA = await createAuthenticatedAgent();
			const userB = await createAuthenticatedAgent();

			const container = await createContainer(userA.userId);
			const item = await createItem(userB.userId);

			const res = await withCsrf(
				userA.agent
					.post(`${BASE}/containers/${container.id}/pack`)
					.send({ itemId: item.id, quantity: 1 }),
				userA.csrfToken
			);

			expectError(res, 404);
		});

		it('returns 404 when the container belongs to another user', async () => {
			const userA = await createAuthenticatedAgent();
			const userB = await createAuthenticatedAgent();

			const container = await createContainer(userA.userId);
			const item = await createItem(userB.userId);

			const res = await withCsrf(
				userB.agent
					.post(`${BASE}/containers/${container.id}/pack`)
					.send({ itemId: item.id, quantity: 1 }),
				userB.csrfToken
			);

			expectError(res, 404, ErrorCode.CONTAINER_NOT_FOUND);
		});
	});

	describe('POST /containers/:id/unpack', () => {
		it('updates container item quantity after unpacking item', async () => {
			const { agent, csrfToken, userId } =
				await createAuthenticatedAgent();

			const container = await createContainer(userId);
			const item = await createItem(userId);

			await prisma.containerItems.create({
				data: {
					containerId: container.id,
					itemId: item.id,
					quantity: 3,
				},
			});

			const res = await withCsrf(
				agent
					.post(`${BASE}/containers/${container.id}/unpack`)
					.send({ itemId: item.id, quantity: 1 }),
				csrfToken
			);

			expect(res.status).toBe(200);

			const record = await prisma.containerItems.findUnique({
				where: {
					containerId_itemId: {
						containerId: container.id,
						itemId: item.id,
					},
				},
			});

			expect(record?.quantity).toBe(2);
		});

		it('returns 401 for unauthenticated requests', async () => {
			const { agent, csrfToken } = await createAnonAgent();

			const res = await withCsrf(
				agent
					.post(`${BASE}/containers/${faker.string.uuid()}/unpack`)
					.send({}),
				csrfToken
			);

			expectError(res, 401);
		});
	});

	describe('POST /containers/move', () => {
		it('moves item atomically between containers', async () => {
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

			const res = await withCsrf(
				agent.post(`${BASE}/containers/move`).send({
					fromContainerId: from.id,
					toContainerId: to.id,
					itemId: item.id,
					quantity: 2,
				}),
				csrfToken
			);

			expect(res.status).toBe(200);

			const fromRecord = await prisma.containerItems.findUnique({
				where: {
					containerId_itemId: {
						containerId: from.id,
						itemId: item.id,
					},
				},
			});

			const toRecord = await prisma.containerItems.findUnique({
				where: {
					containerId_itemId: { containerId: to.id, itemId: item.id },
				},
			});

			expect(fromRecord?.quantity).toBe(1);
			expect(toRecord?.quantity).toBe(2);
		});

		it('returns 401 for unauthenticated requests', async () => {
			const { agent, csrfToken } = await createAnonAgent();

			const res = await withCsrf(
				agent.post(`${BASE}/containers/move`).send({}),
				csrfToken
			);

			expectError(res, 401);
		});
	});
});
