import { describe, it, expect, beforeAll, beforeEach, afterAll } from 'vitest';
import { prisma } from '@prisma';
import {
	BASE,
	createAnonAgent,
	createAuthenticatedAgent,
	expectError,
	seedTestPermissions,
	stripUserId,
	truncateAllTables,
	withCsrf,
} from '@tests';
import { itemFactory } from '@modules/items/__tests__/factories/item.factory';

// ─────────────────────────────────────────────────────────────────────────────
// SUITE SETUP
// ─────────────────────────────────────────────────────────────────────────────

describe('Dashboard Integration', () => {
	beforeAll(async () => {
		await seedTestPermissions();
	});

	beforeEach(async () => {
		await truncateAllTables();
	});

	afterAll(async () => {
		await prisma.$disconnect();
	});

	// ─────────────────────────────────────────────────────────────────────────
	// GET /dashboard
	// ─────────────────────────────────────────────────────────────────────────

	describe('GET /dashboard', () => {
		it('returns 200 with dashboard overview and aggregated data', async () => {
			const { agent, csrfToken } = await createAuthenticatedAgent();

			// Create 7 items — alternating isFragile to get exactly 4 fragile
			// (i=0,2,4,6 → isFragile=true → 4 items)
			for (let i = 0; i < 7; i++) {
				// stripUserId is critical: itemFactory includes userId for unit-test
				// convenience but z.strictObject on the API will 400 if it sees it.
				const payload = stripUserId(
					itemFactory('ignored', { isFragile: i % 2 === 0 })
				);

				const res = await withCsrf(
					agent.post(`${BASE}/items`).send(payload),
					csrfToken
				);

				// Fail fast so test output is clear about which item failed
				if (res.status !== 201) {
					throw new Error(
						`Item ${i} creation failed (${res.status}): ${JSON.stringify(res.body)}`
					);
				}
			}

			const res = await agent.get(`${BASE}/dashboard`);

			expect(res.status).toBe(200);

			const body = res.body.data;

			// Profile section
			expect(body.profile).toBeDefined();
			expect(typeof body.profile.onboardingCompleted).toBe('boolean');

			// Stats
			expect(body.items.stats.totalItems).toBe(7);
			expect(body.items.stats.totalFragileItems).toBe(4);

			// Recent — capped at 5
			expect(body.items.recent.length).toBe(5);

			// Sorted newest first
			const timestamps = body.items.recent.map(
				(item: { createdAt: string }) =>
					new Date(item.createdAt).getTime()
			);
			expect(timestamps).toEqual([...timestamps].sort((a, b) => b - a));

			// ISO date format
			expect(
				() => new Date(body.items.recent[0].createdAt)
			).not.toThrow();

			// Categories section
			expect(Array.isArray(body.items.categories)).toBe(true);
			for (const cat of body.items.categories) {
				expect(cat.category).toBeDefined();
				expect(typeof cat.count).toBe('number');
			}
		});

		it('returns 200 with empty stats when the user has no items', async () => {
			const { agent } = await createAuthenticatedAgent();

			const res = await agent.get(`${BASE}/dashboard`);

			expect(res.status).toBe(200);

			const body = res.body.data;
			expect(body.items.stats.totalItems).toBe(0);
			expect(body.items.stats.totalFragileItems).toBe(0);
			expect(body.items.recent).toEqual([]);
			expect(body.items.categories).toEqual([]);
		});

		it('returns only items belonging to the authenticated user', async () => {
			const userA = await createAuthenticatedAgent();
			const userB = await createAuthenticatedAgent();

			// userA creates 3 items
			for (let i = 0; i < 3; i++) {
				await withCsrf(
					userA.agent
						.post(`${BASE}/items`)
						.send(stripUserId(itemFactory('ignored'))),
					userA.csrfToken
				);
			}

			// userB creates 2 items
			for (let i = 0; i < 2; i++) {
				await withCsrf(
					userB.agent
						.post(`${BASE}/items`)
						.send(stripUserId(itemFactory('ignored'))),
					userB.csrfToken
				);
			}

			// userA's dashboard should only see their 3 items
			const res = await userA.agent.get(`${BASE}/dashboard`);

			expect(res.status).toBe(200);
			expect(res.body.data.items.stats.totalItems).toBe(3);
		});

		it('returns 401 for unauthenticated requests', async () => {
			const { agent } = await createAnonAgent();
			const res = await agent.get(`${BASE}/dashboard`);
			expectError(res, 401);
		});
	});
});
