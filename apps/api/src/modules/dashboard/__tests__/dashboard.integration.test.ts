import { describe, it, expect, beforeEach, afterAll } from 'vitest';

import {
	createAnonAgent,
	createAuthenticatedAgent,
	expectError,
	BASE,
	truncateAllTables,
} from '@tests';

import { itemFactory } from '@modules/items/__tests__/factories/item.factory';
import { prisma } from '@prisma';

describe('Dashboard Integration', () => {
	beforeEach(async () => {
		await truncateAllTables();
	});

	afterAll(async () => {
		await prisma.$disconnect();
	});

	// =========================
	// GET /dashboard
	// =========================
	describe('GET /dashboard', () => {
		it('returns full dashboard overview with aggregated data', async () => {
			// Arrange
			const { agent, csrfToken } = await createAuthenticatedAgent();

			const createdItems: any[] = [];

			// create 7 items (to test recent limit = 5)
			for (let i = 0; i < 7; i++) {
				const { userId: _ignored, ...payload } = itemFactory(
					'ignored',
					{
						isFragile: i % 2 === 0,
					}
				);

				const res = await agent
					.post(`${BASE}/items`)
					.set('x-csrf-token', csrfToken)
					.send(payload);

				createdItems.push(res.body.data);
			}

			// Act
			const res = await agent.get(`${BASE}/dashboard`);

			// Assert
			expect(res.status).toBe(200);

			const body = res.body.data;

			// Profile
			expect(body.profile).toBeDefined();
			expect(typeof body.profile.onboardingCompleted).toBe('boolean');

			// Stats
			expect(body.items.stats.totalItems).toBe(7);
			expect(body.items.stats.totalFragileItems).toBe(4);

			// Recent (max 5)
			expect(body.items.recent.length).toBe(5);

			// Ensure sorted by newest first
			const timestamps = body.items.recent.map((i: any) =>
				new Date(i.createdAt).getTime()
			);
			expect(timestamps).toEqual([...timestamps].sort((a, b) => b - a));

			// ISO format check
			expect(
				() => new Date(body.items.recent[0].createdAt)
			).not.toThrow();

			// Categories
			expect(Array.isArray(body.items.categories)).toBe(true);
			for (const cat of body.items.categories) {
				expect(cat.category).toBeDefined();
				expect(typeof cat.count).toBe('number');
			}
		});

		it('returns empty stats when user has no items', async () => {
			// Arrange
			const { agent } = await createAuthenticatedAgent();

			// Act
			const res = await agent.get(`${BASE}/dashboard`);

			// Assert
			expect(res.status).toBe(200);

			const body = res.body.data;

			expect(body.items.stats.totalItems).toBe(0);
			expect(body.items.stats.totalFragileItems).toBe(0);
			expect(body.items.recent).toEqual([]);
			expect(body.items.categories).toEqual([]);
		});

		it('only returns items belonging to the authenticated user', async () => {
			// Arrange
			const userA = await createAuthenticatedAgent();
			const userB = await createAuthenticatedAgent();

			// userA creates 3 items
			for (let i = 0; i < 3; i++) {
				const { userId: _ignored, ...payload } = itemFactory('ignored');
				await userA.agent
					.post(`${BASE}/items`)
					.set('x-csrf-token', userA.csrfToken)
					.send(payload);
			}

			// userB creates 2 items
			for (let i = 0; i < 2; i++) {
				const { userId: _ignored, ...payload } = itemFactory('ignored');
				await userB.agent
					.post(`${BASE}/items`)
					.set('x-csrf-token', userB.csrfToken)
					.send(payload);
			}

			// Act
			const res = await userA.agent.get(`${BASE}/dashboard`);

			// Assert
			expect(res.status).toBe(200);
			expect(res.body.data.items.stats.totalItems).toBe(3);
		});

		it('returns 401 for unauthenticated requests', async () => {
			// Arrange
			const { agent } = await createAnonAgent();

			// Act
			const res = await agent.get(`${BASE}/dashboard`);

			// Assert
			expectError(res, 401);
		});
	});
});
