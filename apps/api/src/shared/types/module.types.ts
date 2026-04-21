import type { Profile } from '@prisma-generated/client';
import type { UserGetPayload } from '@prisma-generated/models';
import type { SuitcaseWithContainer } from '@modules/suitcases';
import type { BagWithContainer } from '@modules/bags';
import type { ContainerType } from '@beggy/shared/constants';

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

/**
 * Public-facing projection of a user profile.
 *
 * @remarks
 * - Exposes only non-sensitive fields safe for external consumption
 * - Includes computed properties such as `displayName` and `age`
 * - Used in contexts where profile data is shared with other users
 */
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

/**
 * Authenticated user aggregate returned by "me" endpoints.
 *
 * @remarks
 * - Includes associated profile and account data
 * - Explicitly excludes sensitive fields (e.g. `hashedPassword`)
 * - Shape is derived directly from Prisma for consistency with persistence layer
 */
export type AuthMe = UserGetPayload<{
	include: { profile: true; account: { omit: { hashedPassword: true } } };
}>;

/**
 * Discriminated union representing a typed container aggregate.
 *
 * @remarks
 * - Used to model polymorphic container types (e.g. Bag, Suitcase)
 * - Enables exhaustive type-safe handling via `switch (type)`
 * - Consumed by controllers for mapping into DTOs
 *
 * @example
 * ```ts
 * switch (result.type) {
 *   case ContainerType.BAG:
 *     // handle bag
 *     break;
 *   case ContainerType.SUITCASE:
 *     // handle suitcase
 *     break;
 * }
 * ```
 */
export type TypedContainerResult =
	| { type: ContainerType.BAG; data: BagWithContainer }
	| { type: ContainerType.SUITCASE; data: SuitcaseWithContainer };
