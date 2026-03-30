import { describe, it, expect, afterAll } from 'vitest';
import { faker } from '@faker-js/faker';
import {
	createAnonAgent,
	createAuthenticatedAgent,
	expectError,
	expectPaginatedResponse,
	withCsrf,
	BASE,
	truncateAllTables,
} from '@tests';
import { ErrorCode } from '@beggy/shared/constants';
import { bagFactory } from './factories/bag.factory';
import { prisma } from '@prisma';

describe('Bags Integration', () => {
	beforeEach(async () => {
		await truncateAllTables();
	});

	afterAll(async () => {
		await prisma.$disconnect();
	});

	describe('POST /bags', () => {
		it('creates a bag and returns 201 with BagDTO', async () => {
			const { agent, csrfToken } = await createAuthenticatedAgent();

			const { userId: _ignored, ...payload } = bagFactory('ignored');

			const res = await withCsrf(
				agent.post(`${BASE}/bags`).send(payload),
				csrfToken
			);

			expect(res.status).toBe(201);

			expect(res.body.data).toMatchObject({
				name: payload.name,
				type: payload.type,
				size: payload.size,
				maxCapacity: payload.maxCapacity,
				maxWeight: payload.maxWeight,
				emptyWeight: payload.emptyWeight,
			});

			expect(res.body.data.id).toBeDefined();
			expect(res.body.data.status).toBeDefined();
			expect(res.body.data.status.state.status).toBe('empty');
		});

		it('returns 400 for missing required fields', async () => {
			const { agent, csrfToken } = await createAuthenticatedAgent();

			const res = await withCsrf(
				agent.post(`${BASE}/bags`).send({ name: 'Incomplete' }),
				csrfToken
			);

			expectError(res, 400);
		});

		it('returns 401 for unauthenticated requests', async () => {
			const { agent, csrfToken } = await createAnonAgent();

			const res = await withCsrf(
				agent.post(`${BASE}/bags`).send(bagFactory('ignored')),
				csrfToken
			);

			expectError(res, 401);
		});
	});

	describe('GET /bags', () => {
		it('returns a paginated list of bags', async () => {
			const { agent, csrfToken } = await createAuthenticatedAgent();

			const { userId: _ignored, ...payload } = bagFactory('ignored');

			await withCsrf(agent.post(`${BASE}/bags`).send(payload), csrfToken);

			const res = await agent.get(`${BASE}/bags`);

			expect(res.status).toBe(200);
			expectPaginatedResponse(res.body);
			expect(res.body.data.length).toBeGreaterThan(0);
		});

		it('returns 401 for unauthenticated requests', async () => {
			const { agent } = await createAnonAgent();
			const res = await agent.get(`${BASE}/bags`);
			expectError(res, 401);
		});

		it('returns only bags belonging to the authenticated user', async () => {
			const userA = await createAuthenticatedAgent();
			const userB = await createAuthenticatedAgent();

			const { userId: _ignored, ...payload } = bagFactory('ignored');

			await withCsrf(
				userA.agent.post(`${BASE}/bags`).send(payload),
				userA.csrfToken
			);

			const res = await userB.agent.get(`${BASE}/bags`);
			expect(res.status).toBe(200);
			expect(res.body.data).toHaveLength(0);
		});
	});

	describe('GET /bags/:id', () => {
		it('returns the bag when it belongs to the user', async () => {
			const { agent, csrfToken } = await createAuthenticatedAgent();

			const { userId: _ignored, ...payload } = bagFactory('ignored');

			const createRes = await withCsrf(
				agent.post(`${BASE}/bags`).send(payload),
				csrfToken
			);
			const bagId = createRes.body.data.id as string;

			const res = await agent.get(`${BASE}/bags/${bagId}`);

			expect(res.status).toBe(200);
			expect(res.body.data.id).toBe(bagId);
			expect(res.body.data.status).toBeDefined();
		});

		it('returns 404 for a non-existent bag', async () => {
			const { agent } = await createAuthenticatedAgent();
			const res = await agent.get(`${BASE}/bags/${faker.string.uuid()}`);
			expectError(res, 404, ErrorCode.BAG_NOT_FOUND);
		});

		it('returns 404 when the bag belongs to another user', async () => {
			const userA = await createAuthenticatedAgent();
			const userB = await createAuthenticatedAgent();

			const { userId: _ignored, ...payload } = bagFactory('ignored');

			const createRes = await withCsrf(
				userA.agent.post(`${BASE}/bags`).send(payload),
				userA.csrfToken
			);
			const bagId = createRes.body.data.id as string;

			const res = await userB.agent.get(`${BASE}/bags/${bagId}`);
			expectError(res, 404, ErrorCode.BAG_NOT_FOUND);
		});
	});

	describe('PATCH /bags/:id', () => {
		it('updates bag cosmetic fields and returns the updated bag', async () => {
			const { agent, csrfToken } = await createAuthenticatedAgent();

			const { userId: _ignored, ...payload } = bagFactory('ignored');

			const createRes = await withCsrf(
				agent.post(`${BASE}/bags`).send(payload),
				csrfToken
			);
			const bagId = createRes.body.data.id as string;

			const res = await withCsrf(
				agent
					.patch(`${BASE}/bags/${bagId}`)
					.send({ name: 'Updated Name', color: 'navy' }),
				csrfToken
			);

			expect(res.status).toBe(200);
			expect(res.body.data.name).toBe('Updated Name');
			expect(res.body.data.color).toBe('navy');
		});

		it('updates container constraints and returns the updated bag', async () => {
			const { agent, csrfToken } = await createAuthenticatedAgent();

			const { userId: _ignored, ...payload } = bagFactory('ignored');

			const createRes = await withCsrf(
				agent.post(`${BASE}/bags`).send(payload),
				csrfToken
			);
			const bagId = createRes.body.data.id as string;

			const res = await withCsrf(
				agent
					.patch(`${BASE}/bags/${bagId}`)
					.send({ maxCapacity: 50, maxWeight: 20, emptyWeight: 2.5 }),
				csrfToken
			);

			expect(res.status).toBe(200);
			expect(res.body.data.maxCapacity).toBe(50);
			expect(res.body.data.maxWeight).toBe(20);
			expect(res.body.data.emptyWeight).toBe(2.5);
		});

		it('returns 404 for a non-existent bag', async () => {
			const { agent, csrfToken } = await createAuthenticatedAgent();

			const res = await withCsrf(
				agent
					.patch(`${BASE}/bags/${faker.string.uuid()}`)
					.send({ name: 'Ghost' }),
				csrfToken
			);

			expectError(res, 404, ErrorCode.BAG_NOT_FOUND);
		});

		it('returns 404 when the bag belongs to another user', async () => {
			const userA = await createAuthenticatedAgent();
			const userB = await createAuthenticatedAgent();

			const { userId: _ignored, ...payload } = bagFactory('ignored');

			const createRes = await withCsrf(
				userA.agent.post(`${BASE}/bags`).send(payload),
				userA.csrfToken
			);
			const bagId = createRes.body.data.id as string;

			const res = await withCsrf(
				userB.agent
					.patch(`${BASE}/bags/${bagId}`)
					.send({ name: 'Hijack' }),
				userB.csrfToken
			);

			expectError(res, 404, ErrorCode.BAG_NOT_FOUND);
		});
	});

	describe('DELETE /bags/:id', () => {
		it('deletes the bag and returns 204', async () => {
			const { agent, csrfToken } = await createAuthenticatedAgent();

			const { userId: _ignored, ...payload } = bagFactory('ignored');

			const createRes = await withCsrf(
				agent.post(`${BASE}/bags`).send(payload),
				csrfToken
			);
			const bagId = createRes.body.data.id as string;

			const deleteRes = await withCsrf(
				agent.delete(`${BASE}/bags/${bagId}`),
				csrfToken
			);
			expect(deleteRes.status).toBe(204);

			const getRes = await agent.get(`${BASE}/bags/${bagId}`);
			expectError(getRes, 404, ErrorCode.BAG_NOT_FOUND);
		});

		it('returns 404 for a non-existent bag', async () => {
			const { agent, csrfToken } = await createAuthenticatedAgent();

			const res = await withCsrf(
				agent.delete(`${BASE}/bags/${faker.string.uuid()}`),
				csrfToken
			);

			expectError(res, 404, ErrorCode.BAG_NOT_FOUND);
		});

		it('returns 404 when the bag belongs to another user', async () => {
			const userA = await createAuthenticatedAgent();
			const userB = await createAuthenticatedAgent();

			const { userId: _ignored, ...payload } = bagFactory('ignored');

			const createRes = await withCsrf(
				userA.agent.post(`${BASE}/bags`).send(payload),
				userA.csrfToken
			);
			const bagId = createRes.body.data.id as string;

			const res = await withCsrf(
				userB.agent.delete(`${BASE}/bags/${bagId}`),
				userB.csrfToken
			);

			expectError(res, 404, ErrorCode.BAG_NOT_FOUND);
		});
	});
});
