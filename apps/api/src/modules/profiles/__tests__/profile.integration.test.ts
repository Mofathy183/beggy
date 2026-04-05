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

describe('Profiles Integration', () => {
	beforeAll(async () => {
		await seedTestPermissions();
	});

	beforeEach(async () => {
		await truncateAllTables();
	});

	afterAll(async () => {
		await prisma.$disconnect();
	});

	describe('GET /profiles/me', () => {
		it('returns 200 with the authenticated user private profile', async () => {
			const { agent, userId } = await createAuthenticatedAgent();

			const res = await agent.get(`${BASE}/profiles/me`);

			expect(res.status).toBe(200);
			expect(res.body.data.userId).toBe(userId);
			expect(res.body.data).toHaveProperty('displayName');
			expect(res.body.data).toHaveProperty('onboardingCompleted');
		});

		it('returns 401 for unauthenticated requests', async () => {
			const { agent } = await createAnonAgent();

			const res = await agent.get(`${BASE}/profiles/me`);

			expectError(res, 401);
		});
	});

	describe('GET /profiles/:id', () => {
		it('returns 200 with the public profile without sensitive fields', async () => {
			const { agent } = await createAuthenticatedAgent();

			const privateRes = await agent.get(`${BASE}/profiles/me`);
			const profileId = privateRes.body.data.id;

			const res = await agent.get(`${BASE}/profiles/${profileId}`);

			expect(res.status).toBe(200);

			expect(res.body.data).toMatchObject({
				id: profileId,
			});

			// Public DTO must NOT expose private fields
			expect(res.body.data).not.toHaveProperty('userId');
			expect(res.body.data).not.toHaveProperty('onboardingCompleted');
		});

		it('returns 404 when the profile does not exist', async () => {
			const { agent } = await createAuthenticatedAgent();

			const res = await agent.get(
				`${BASE}/profiles/${faker.string.uuid()}`
			);

			expectError(res, 404, ErrorCode.PROFILE_NOT_FOUND);
		});

		it('returns 200 when accessed without authentication', async () => {
			const user = await createAuthenticatedAgent();

			const privateRes = await user.agent.get(`${BASE}/profiles/me`);
			const profileId = privateRes.body.data.id;

			const { agent } = await createAnonAgent();

			const res = await agent.get(`${BASE}/profiles/${profileId}`);

			expect(res.status).toBe(200);
		});
	});

	describe('PATCH /profiles/me', () => {
		it('updates the profile fields and returns ProfileDTO', async () => {
			const { agent, csrfToken } = await createAuthenticatedAgent();

			const payload = {
				firstName: 'Updated',
				lastName: 'User',
				city: 'Cairo',
			};

			const res = await withCsrf(
				agent.patch(`${BASE}/profiles/me`).send(payload),
				csrfToken
			);

			expect(res.status).toBe(200);

			expect(res.body.data).toMatchObject({
				firstName: 'Updated',
				lastName: 'User',
				city: 'Cairo',
			});
		});

		it('returns 400 for invalid payload', async () => {
			const { agent, csrfToken } = await createAuthenticatedAgent();

			const res = await withCsrf(
				agent.patch(`${BASE}/profiles/me`).send({
					birthDate: 'invalid-date',
				}),
				csrfToken
			);

			expectError(res, 400);
		});

		it('returns 401 for unauthenticated requests', async () => {
			const { agent, csrfToken } = await createAnonAgent();

			const res = await withCsrf(
				agent.patch(`${BASE}/profiles/me`).send({ firstName: 'X' }),
				csrfToken
			);

			expectError(res, 401);
		});
	});

	describe('POST /profiles/me/onboarding', () => {
		it('completes onboarding and returns the profile with onboardingCompleted set to true', async () => {
			const { agent, csrfToken } = await createAuthenticatedAgent();

			const payload = {
				firstName: 'Onboarded',
				country: 'Egypt',
			};

			const res = await withCsrf(
				agent.post(`${BASE}/profiles/me/onboarding`).send(payload),
				csrfToken
			);

			expect(res.status).toBe(200);

			expect(res.body.data.onboardingCompleted).toBe(true);
			expect(res.body.data.firstName).toBe('Onboarded');
		});

		it('returns 401 for unauthenticated requests', async () => {
			const { agent, csrfToken } = await createAnonAgent();

			const res = await withCsrf(
				agent.post(`${BASE}/profiles/me/onboarding`).send({}),
				csrfToken
			);

			expectError(res, 401);
		});
	});
});
