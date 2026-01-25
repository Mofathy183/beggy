import request from 'supertest';
import express from 'express';
import { describe, it, expect, beforeEach, vi } from 'vitest';

import { STATUS_CODE } from '@shared/constants';

// ---- Prisma mock (import-time safety) ----
vi.mock('@prisma/prisma.client', () => ({
	prisma: {
		profile: {
			findUnique: vi.fn(),
			update: vi.fn(),
		},
	},
}));

vi.mock('@shared/middlewares/auth.middleware', async () => {
	const actual = await vi.importActual<any>(
		'@shared/middlewares/auth.middleware'
	);
	const passThrough: express.RequestHandler = (_req, _res, next) => next();

	return {
		...actual,
		requireAuth: passThrough,
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
		validateUuidParam: passThrough,
	};
});

import {
	ProfileController,
	createProfileRouter,
	ProfileService,
} from '@modules/profiles';

import { buildProfile, profileFactory } from './factories/profile.factory';

const setupApp = (service: ProfileService) => {
	const app = express();
	app.use(express.json());

	// Inject authenticated user context
	app.use((req: any, _res, next) => {
		req.user = { id: 'user-123' };
		next();
	});

	const controller = new ProfileController(service);
	app.use('/profiles', createProfileRouter(controller));

	return app;
};

describe('Profiles API', () => {
	let profileService: ProfileService;

	beforeEach(() => {
		profileService = {
			getPrivateProfile: vi.fn(),
			getPublicProfile: vi.fn(),
			updateProfile: vi.fn(),
		} as unknown as ProfileService;
	});

	describe('GET /profiles/me', () => {
		it('returns the authenticated user profile', async () => {
			// Arrange
			const profile = buildProfile('user-123');

			(profileService.getPrivateProfile as any).mockResolvedValue(
				profile
			);

			const app = setupApp(profileService);

			// Act
			const response = await request(app).get('/profiles/me');

			// Assert
			expect(response.status).toBe(STATUS_CODE.OK);
			expect(response.body).toMatchObject({
				data: expect.any(Object),
			});

			expect(profileService.getPrivateProfile).toHaveBeenCalledOnce();
			expect(profileService.getPrivateProfile).toHaveBeenCalledWith(
				'user-123'
			);
		});
	});

	describe('GET /profiles/:id', () => {
		it('returns a public profile', async () => {
			// Arrange
			const profile = buildProfile('user-1');

			(profileService.getPublicProfile as any).mockResolvedValue(profile);

			const app = setupApp(profileService);

			// Act
			const response = await request(app).get(`/profiles/${profile.id}`);

			// Assert
			expect(response.status).toBe(STATUS_CODE.OK);
			expect(response.body).toMatchObject({
				data: expect.any(Object),
			});

			expect(profileService.getPublicProfile).toHaveBeenCalledOnce();
			expect(profileService.getPublicProfile).toHaveBeenCalledWith(
				profile.id
			);
		});
	});

	describe('PATCH /profiles/me', () => {
		it('updates the authenticated user profile', async () => {
			// Arrange
			const payload = profileFactory('');
			const updatedProfile = buildProfile('user-123', payload);

			(profileService.updateProfile as any).mockResolvedValue(
				updatedProfile
			);

			const app = setupApp(profileService);

			// Act
			const response = await request(app)
				.patch('/profiles/me')
				.send(payload);

			// Assert
			expect(response.status).toBe(STATUS_CODE.OK);
			expect(response.body).toMatchObject({
				data: expect.any(Object),
			});

			expect(profileService.updateProfile).toHaveBeenCalledOnce();
			expect(profileService.updateProfile).toHaveBeenCalledWith(
				'user-123',
				payload
			);
		});
	});

	it('fails when an unexpected error occurs', async () => {
		(profileService.getPublicProfile as any).mockRejectedValue(
			new Error('boom')
		);

		const app = setupApp(profileService);
		const res = await request(app).get('/profiles/123');

		expect(res.status).toBe(STATUS_CODE.INTERNAL_ERROR);
	});
});
