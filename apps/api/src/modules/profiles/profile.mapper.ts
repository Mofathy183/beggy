import { getAge, getDisplayName } from '@prisma';
import type { ProfileDTO, PublicProfileDTO } from '@beggy/shared/types';
import { type Gender } from '@beggy/shared/constants';
import { toISO } from '@shared/utils';
import type { PublicProfileEntity, ProfileWithComputed } from '@shared/types';

/**
 * Profile domain mapper.
 *
 * @remarks
 * - Transforms persistence-layer Profile models into API-safe DTOs
 * - Centralizes field exposure rules
 * - Computes derived fields consistently across the application
 *
 * This mapper intentionally:
 * - Does NOT expose internal database fields
 * - Does NOT perform authorization checks
 * - Does NOT mutate the input object
 */
export const ProfileMapper = {
	/**
	 * Maps a Profile model (with optional computed fields)
	 * to a {@link ProfileDTO}.
	 *
	 * @param profile - Profile entity from the persistence layer
	 *
	 * @returns Normalized {@link ProfileDTO} ready for API responses
	 *
	 * @remarks
	 * - Converts Date objects to ISO strings
	 * - Ensures consistent nullability for optional fields
	 * - Computes `displayName` and `age` when not precomputed
	 *
	 * @example
	 * ```ts
	 * const profileDto = ProfileMapper.toDTO(profile);
	 * ```
	 */
	toDTO(profile: ProfileWithComputed): ProfileDTO {
		return {
			/** Unique profile identifier */
			id: profile.id,

			/** Owning user identifier */
			userId: profile.userId,

			/** User's first name */
			firstName: profile.firstName,

			/** User's last name */
			lastName: profile.lastName,

			/** Public avatar URL */
			avatarUrl: profile.avatarUrl,

			/** Gender enum (API-facing) */
			gender: profile.gender as Gender,

			/**
			 * Birth date in ISO-8601 format.
			 *
			 * @remarks
			 * - Null when not provided
			 * - Normalized for transport safety
			 */
			birthDate: profile.birthDate ? toISO(profile.birthDate) : null,

			/** Country of residence */
			country: profile.country,

			/** City of residence */
			city: profile.city,

			/**
			 * Display name shown to clients.
			 *
			 * @remarks
			 * - Uses precomputed value when available
			 * - Falls back to first + last name composition
			 */
			displayName:
				profile.displayName ??
				getDisplayName(profile.firstName, profile.lastName),

			/**
			 * User age.
			 *
			 * @remarks
			 * - Uses precomputed value when available
			 * - Falls back to calculation from birth date
			 * - Null when birth date is missing
			 */
			age:
				profile.age ??
				(profile.birthDate ? getAge(profile.birthDate) : null),

			/** Profile creation timestamp (ISO-8601) */
			createdAt: toISO(profile.createdAt),

			/** Profile last update timestamp (ISO-8601) */
			updatedAt: toISO(profile.updatedAt),
		};
	},

	toPublicDTO: (profile: PublicProfileEntity): PublicProfileDTO => {
		return {
			/** Unique profile identifier */
			id: profile.id,

			/** User's first name */
			firstName: profile.firstName,

			/** User's last name */
			lastName: profile.lastName,

			/** Public avatar URL */
			avatarUrl: profile.avatarUrl,

			/** Country of residence */
			country: profile.country,

			/** City of residence */
			city: profile.city,

			/**
			 * Display name shown to clients.
			 *
			 * @remarks
			 * - Uses precomputed value when available
			 * - Falls back to first + last name composition
			 */
			displayName:
				profile.displayName ??
				getDisplayName(profile.firstName, profile.lastName),

			/**
			 * User age.
			 *
			 * @remarks
			 * - Uses precomputed value when available
			 * - Falls back to calculation from birth date
			 * - Null when birth date is missing
			 */
			age:
				profile.age ??
				(profile.birthDate ? getAge(profile.birthDate) : null),
		};
	},
};
