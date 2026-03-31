import type { PrismaClientType } from '@prisma';
import { type EditProfileInput } from '@beggy/shared/types';
import { ErrorCode } from '@beggy/shared/constants';
import { type Profile } from '@prisma-generated/client';
import type { PublicProfileEntity } from '@shared/types';
import { BaseService } from '@shared/core';

/**
 * ProfileService
 *
 * Encapsulates all Profile-related business logic and persistence access.
 *
 * Responsibilities:
 * - Interact with Prisma
 * - Enforce domain-level invariants
 * - Translate missing data into domain errors
 *
 * Non-responsibilities:
 * - HTTP concerns
 * - DTO mapping
 * - Authorization checks
 */
export class ProfileService extends BaseService {
	constructor(private readonly prisma: PrismaClientType) {
		super({ domain: 'profiles', service: 'ProfileService' });
	}

	/**
	 * Retrieves the private profile for a given user.
	 *
	 * @param userId - Authenticated user's ID
	 * @throws PROFILE_NOT_FOUND if no profile exists
	 */
	async getPrivateProfile(userId: string): Promise<Profile> {
		const profile = await this.prisma.profile.findUnique({
			where: { userId },
		});

		return this.assertFound<Profile>(profile, ErrorCode.PROFILE_NOT_FOUND, {
			userId,
		});
	}

	/**
	 * Retrieves a public-facing profile by profile ID.
	 *
	 * @remarks
	 * - Uses a Prisma `select` to enforce field-level exposure
	 * - Prevents accidental leakage of private fields
	 *
	 * @param profileId - Public profile identifier
	 */
	async getPublicProfile(profileId: string): Promise<PublicProfileEntity> {
		const profile = await this.prisma.profile.findUnique({
			where: { id: profileId },
			select: {
				id: true,
				firstName: true,
				lastName: true,
				avatarUrl: true,
				birthDate: true,
				country: true,
				city: true,
				displayName: true,
				age: true,
			},
		});

		return this.assertFound<PublicProfileEntity>(
			profile,
			ErrorCode.PROFILE_NOT_FOUND,
			{
				profileId,
			}
		);
	}

	/**
	 * Updates a user's profile using PATCH semantics.
	 *
	 * @remarks
	 * - Only provided fields are updated
	 * - `undefined` and `null` values are ignored
	 * - Existing values remain unchanged if not supplied
	 *
	 * @param userId - Owner of the profile
	 * @param profile - Partial profile update payload
	 */
	async updateProfile(
		userId: string,
		profile: EditProfileInput
	): Promise<Profile> {
		const updatedProfile = await this.prisma.profile.update({
			where: { userId },
			data: this.stripNullish(profile as Record<string, unknown>),
		});

		return updatedProfile;
	}

	/**
	 * Completes the onboarding process for a user profile.
	 *
	 * @param userId - Authenticated user identifier
	 * @param profile - Partial profile data collected during onboarding
	 *
	 * @returns Updated {@link Profile} entity
	 *
	 * @remarks
	 * - Ignores `undefined` and `null` values to prevent accidental
	 *   overwriting of existing profile data.
	 * - Marks the profile as `onboardingCompleted`.
	 */
	async completeOnboarding(
		userId: string,
		profile: EditProfileInput
	): Promise<Profile> {
		this.log.info({ userId }, 'User onboarding completed');

		return this.prisma.profile.update({
			where: { userId },
			data: {
				...this.stripNullish(profile as Record<string, unknown>),
				onboardingCompleted: true,
			},
		});
	}
}
