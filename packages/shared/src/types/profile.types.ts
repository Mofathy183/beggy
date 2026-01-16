import { type User, Gender } from '../types/user.types.js';

/**
 * User profile containing public and user-editable information.
 *
 * @remarks
 * - Separated from the User model to enforce clear security boundaries
 * - Safe to expose (partially) to clients via controlled DTOs
 * - Does not contain authentication or authorization data
 */
export interface Profile {
	/**
	 * Primary identifier for the profile.
	 */
	id: string;

	/**
	 * Identifier of the associated user.
	 *
	 * @remarks
	 * Enforces a strict one-to-one relationship with User.
	 */
	userId: string;

	/**
	 * User first name.
	 */
	firstName: string;

	/**
	 * User last name.
	 */
	lastName: string;

	/**
	 * Public avatar image URL.
	 *
	 * @remarks
	 * Managed externally (e.g. CDN or object storage).
	 */
	avatarUrl: string | null;

	/**
	 * Optional gender information.
	 */
	gender: Gender | null;

	/**
	 * Optional birth date.
	 *
	 * @remarks
	 * Used only for derived calculations (e.g. age).
	 */
	birthDate: Date | null;

	/**
	 * Optional country.
	 */
	country: string | null;

	/**
	 * Computed profile fields.
	 *
	 * @remarks
	 * - Derived from profile data
	 * - Read-only values exposed for API responses
	 * - Never persisted directly in the database
	 */
	displayName?: string | null;
	age?: number | null;

	/**
	 * Optional city.
	 */
	city: string | null;

	/**
	 * Profile creation timestamp.
	 */
	createdAt: Date;

	/**
	 * Profile last update timestamp.
	 */
	updatedAt: Date;
}

/**
 * Profile model with resolved relations.
 *
 * @remarks
 * - Intended for internal or service-layer usage
 * - Should not be returned directly to public clients
 */
export interface ProfileWithRelations extends Profile {
	/**
	 * Owning user identity.
	 */
	user: User;
}
