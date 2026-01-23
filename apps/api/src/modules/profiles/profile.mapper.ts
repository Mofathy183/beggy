import { Profile } from '@prisma/generated/prisma/client';
import { getAge, getDisplayName } from '@prisma';
import type { ProfileDTO } from '@beggy/shared/types';
import { Gender } from '@beggy/shared/constants';
import { toISO } from '@shared/utils';

/**
 * Extended Profile model with optional computed fields.
 *
 * @remarks
 * - Used internally in the service/mapping layer
 * - Allows passing precomputed values from the database layer
 *   (e.g. via raw SQL, Prisma extensions, or SELECT aliases)
 * - Keeps DTO mapping logic flexible without polluting persistence models
 */
type ProfileWithComputed = Profile & {
	/**
	 * Precomputed display name.
	 *
	 * @remarks
	 * - May be injected by the query layer
	 * - Falls back to computed value in the mapper if not provided
	 */
	displayName?: string | null;

	/**
	 * Precomputed age.
	 *
	 * @remarks
	 * - Optional optimization to avoid recomputation
	 * - Falls back to runtime calculation if not provided
	 */
	age?: number | null;
};

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
};
