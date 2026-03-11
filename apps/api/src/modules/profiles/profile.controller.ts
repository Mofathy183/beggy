import type { Request, Response } from 'express';
import { ProfileMapper, type ProfileService } from '@modules/profiles';
import { apiResponseMap } from '@shared/utils';
import { STATUS_CODE } from '@shared/constants';
import type { ProfileDTO } from '@beggy/shared/types';
import { BaseController } from '@shared/core';
import { logger } from '@shared/middlewares';

/**
 * ProfileController
 *
 * Bridges HTTP requests to the Profile domain.
 *
 * Responsibilities:
 * - Extract request data
 * - Call service methods
 * - Map domain models to DTOs
 * - Return standardized API responses
 *
 * Non-responsibilities:
 * - Business logic
 * - Persistence
 */
export class ProfileController extends BaseController {
	constructor(private readonly profileService: ProfileService) {
		super(
			logger.child({
				domain: 'profiles',
				controller: 'ProfileController',
			})
		);
	}

	/**
	 * GET /profiles/me
	 *
	 * Returns the authenticated user's private profile.
	 */
	getPrivateProfile = async (req: Request, res: Response): Promise<void> => {
		this.assertAuthenticated(req);
		const profile = await this.profileService.getPrivateProfile(
			req.user?.id
		);

		res.status(STATUS_CODE.OK).json(
			apiResponseMap.ok(ProfileMapper.toDTO(profile), 'PROFILE_UPDATED')
		);
	};

	/**
	 * GET /profiles/:id
	 *
	 * Returns a public profile by ID.
	 */
	getPublicProfile = async (req: Request, res: Response): Promise<void> => {
		const { id: profileId } = req.params;

		const profile = await this.profileService.getPublicProfile(
			profileId as string
		);

		res.status(STATUS_CODE.OK).json(
			apiResponseMap.ok(
				ProfileMapper.toPublicDTO(profile),
				'PROFILE_UPDATED'
			)
		);
	};

	/**
	 * PATCH /profiles/me
	 *
	 * Updates the authenticated user's profile.
	 */
	updateUserProfile = async (req: Request, res: Response): Promise<void> => {
		this.assertAuthenticated(req);
		const userId = req.user?.id;

		const updatedProfile = await this.profileService.updateProfile(
			userId,
			req.body
		);

		res.status(STATUS_CODE.OK).json(
			apiResponseMap.ok<ProfileDTO>(
				ProfileMapper.toDTO(updatedProfile),
				'PROFILE_UPDATED'
			)
		);
	};

	/**
	 * @route POST /profiles/me/onboarding
	 *
	 * Completes the authenticated user's onboarding process.
	 *
	 * @description
	 * Updates the user's profile with onboarding data and marks
	 * the profile as fully initialized.
	 *
	 * @remarks
	 * Requires authentication. The user ID is derived from the
	 * request context populated by the authentication middleware.
	 */
	completeOnboarding = async (req: Request, res: Response): Promise<void> => {
		this.assertAuthenticated(req);
		const userId = req.user?.id;

		const updatedProfile = await this.profileService.completeOnboarding(
			userId,
			req.body
		);

		res.status(STATUS_CODE.OK).json(
			apiResponseMap.ok<ProfileDTO>(
				ProfileMapper.toDTO(updatedProfile),
				'ONBOARDING_COMPLETED'
			)
		);
	};
}
