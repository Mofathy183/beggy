import type { Request, Response } from 'express';
import { ProfileMapper, type ProfileService } from '@modules/profiles';
import type { ProfileDTO, PublicProfileDTO } from '@beggy/shared/types';
import { BaseController } from '@shared/core';

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
		super({ domain: 'profiles', controller: 'ProfileController' });
	}

	/**
	 * GET /profiles/me
	 *
	 * Returns the authenticated user's private profile.
	 */
	getPrivateProfile = async (req: Request, res: Response): Promise<void> => {
		const userId = this.getUserId(req);
		const profile = await this.profileService.getPrivateProfile(userId);

		this.ok(res, ProfileMapper.toDTO(profile), 'PROFILE_UPDATED');
	};

	/**
	 * GET /profiles/:id
	 *
	 * Returns a public profile by ID.
	 */
	getPublicProfile = async (req: Request, res: Response): Promise<void> => {
		const profileId = this.getParam(req);

		const profile = await this.profileService.getPublicProfile(profileId);

		this.ok<PublicProfileDTO>(
			res,
			ProfileMapper.toPublicDTO(profile),
			'PROFILE_FETCHED'
		);
	};

	/**
	 * PATCH /profiles/me
	 *
	 * Updates the authenticated user's profile.
	 */
	updateUserProfile = async (req: Request, res: Response): Promise<void> => {
		const userId = this.getUserId(req);

		const updatedProfile = await this.profileService.updateProfile(
			userId,
			req.body
		);

		this.ok<ProfileDTO>(
			res,
			ProfileMapper.toDTO(updatedProfile),
			'PROFILE_UPDATED'
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
		const userId = this.getUserId(req);

		const updatedProfile = await this.profileService.completeOnboarding(
			userId,
			req.body
		);

		this.ok<ProfileDTO>(
			res,
			ProfileMapper.toDTO(updatedProfile),
			'ONBOARDING_COMPLETED'
		);
	};
}
