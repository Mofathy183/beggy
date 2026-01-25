import type * as z from 'zod';
import { type ProfileSchema } from '../schemas/profile.schema.js';
import type { Gender } from '../constants/profile.enums.js';
import type { ISODateString } from './index.js';

/**
 * User profile containing public and user-editable information.
 *
 * @remarks
 * - Separated from the User model to enforce clear security boundaries
 * - Safe to expose (partially) to clients via controlled DTOs
 * - Does not contain authentication or authorization data
 */
export interface ProfileDTO {
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
	birthDate: ISODateString | null;

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
	 * Profile creation ISODateString.
	 */
	createdAt: ISODateString;

	/**
	 * Profile last update ISODateString.
	 */
	updatedAt: ISODateString;
}

export type PublicProfileDTO = Pick<
	ProfileDTO,
	| 'id'
	| 'firstName'
	| 'lastName'
	| 'avatarUrl'
	| 'country'
	| 'city'
	| 'displayName'
	| 'age'
>;

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
