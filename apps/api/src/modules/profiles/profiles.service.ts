import type { PrismaClientType } from '@prisma';
import { EditProfileInput } from '@beggy/shared/types';
import { ErrorCode } from '@beggy/shared/constants';
import { Profile } from '@prisma-generated/client';
import type { PublicProfileEntity } from '@shared/types';
import { appErrorMap } from '@shared/utils';
import { logger } from '@shared/middlewares';

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
export class ProfileService {
	constructor(private readonly prisma: PrismaClientType) {}

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

		if (!profile) {
			logger.warn({ userId }, 'Profile not found');
			throw appErrorMap.notFound(ErrorCode.PROFILE_NOT_FOUND);
		}

		return profile;
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

		if (!profile) {
			logger.warn({ profileId }, 'Profile not found');
			throw appErrorMap.notFound(ErrorCode.PROFILE_NOT_FOUND);
		}

		return profile;
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
			data: Object.fromEntries(
				Object.entries(profile).filter(
					([, value]) => value !== undefined && value !== null
				)
			),
		});

		return updatedProfile;
	}
}
