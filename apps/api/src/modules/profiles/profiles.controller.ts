import type { Request, Response } from 'express';
import { ProfileMapper, ProfileService } from '@modules/profiles';
import { apiResponseMap } from '@shared/utils';
import { STATUS_CODE } from '@shared/constants';
import type { ProfileDTO } from '@beggy/shared/types';

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
export class ProfileController {
	constructor(private readonly profileService: ProfileService) {
		// Bind methods to preserve `this` when passed as callbacks
		this.getPrivateProfile = this.getPrivateProfile.bind(this);
		this.getPublicProfile = this.getPublicProfile.bind(this);
		this.updateUserProfile = this.updateUserProfile.bind(this);
	}

	/**
	 * GET /profiles/me
	 *
	 * Returns the authenticated user's private profile.
	 */
	async getPrivateProfile(req: Request, res: Response): Promise<void> {
		const profile = await this.profileService.getPrivateProfile(
			req.user?.id as string
		);

		res.status(STATUS_CODE.OK).json(
			apiResponseMap.ok(ProfileMapper.toDTO(profile), 'PROFILE_UPDATED')
		);
	}

	/**
	 * GET /profiles/:id
	 *
	 * Returns a public profile by ID.
	 */
	async getPublicProfile(req: Request, res: Response): Promise<void> {
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
	}

	/**
	 * PATCH /profiles/me
	 *
	 * Updates the authenticated user's profile.
	 */
	async updateUserProfile(req: Request, res: Response): Promise<void> {
		const userId = req.user?.id as string;

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
	}
}
