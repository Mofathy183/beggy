import * as z from 'zod';
import { type User } from '../types/user.types.js';
import { ProfileSchema } from '../schemas/profile.schema.js';

/**
 * Gender classification for user profiles.
 *
 * @remarks
 * - Optional and user-provided
 * - Should never be required for authentication or authorization
 * - Included strictly for profile and UX personalization
 */
export enum Gender {
	MALE = 'MALE',
	FEMALE = 'FEMALE',
	OTHER = 'OTHER',
}

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

/**
 * Allowed "order by" fields for Profile queries.
 *
 * @remarks
 * - Exposes only non-sensitive, profile-facing fields
 * - Prevents sorting by internal or private profile attributes
 */
export enum ProfileOrderByField {
	CREATED_AT = 'createdAt',
	UPDATED_AT = 'updatedAt',
	FIRST_NAME = 'firstName',
	LAST_NAME = 'lastName',
}

// ─────────────────────────────────────────────
// Schemas with identical input & output
// (No transforms → input === payload)
//
// Frontend uses Input types only
// Services only accept Payload types
// ─────────────────────────────────────────────

// ==================================================
// Profile SCHEMA
// ==================================================
// These types belong to self-service user actions
// Authenticated user modifying their own data

export type EditProfileInput = z.infer<typeof ProfileSchema.editProfile>;
