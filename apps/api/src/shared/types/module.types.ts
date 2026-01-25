import { Profile } from '@prisma-generated/client';

/**
 * Extended Profile model with optional computed fields.
 *
 * @remarks
 * - Used internally in the service/mapping layer
 * - Allows passing precomputed values from the database layer
 *   (e.g. via raw SQL, Prisma extensions, or SELECT aliases)
 * - Keeps DTO mapping logic flexible without polluting persistence models
 */
export type ProfileWithComputed = Profile & {
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

export type PublicProfileEntity = Pick<
	ProfileWithComputed,
	| 'id'
	| 'firstName'
	| 'lastName'
	| 'avatarUrl'
	| 'country'
	| 'city'
	| 'birthDate'
	| 'displayName'
	| 'age'
>;
