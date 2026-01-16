/**
 * API Response Types for User
 * These types represent the data structure returned from the API endpoints.
 * They are derived from Prisma models but tailored for API responses.
 */
import * as z from 'zod';
import { AdminSchema } from '../schemas/user.schema.js';
import type { AuthProvider, Role, UserToken } from '../types/auth.types.js';
import type { Profile } from '../types/profile.types.js';
import type { Bag } from '../types/bag.types.js';
import type { Suitcase } from '../types/suitcase.types.js';
import type { Item } from '../types/item.types.js';

/**
 * Authentication account linked to a user.
 *
 * @remarks
 * - Represents a single authentication method (LOCAL or OAuth)
 * - A user may have multiple accounts linked to different providers
 * - Security-sensitive fields must never be exposed to clients
 */
export interface Account {
	/**
	 * Primary identifier for the account.
	 */
	id: string;

	/**
	 * Authentication provider used by this account.
	 */
	authProvider: AuthProvider;

	/**
	 * External provider identifier.
	 *
	 * @remarks
	 * - Used only for OAuth-based authentication
	 * - Must be unique per provider
	 * - Always null for LOCAL authentication
	 */
	providerId: string | null;

	/**
	 * Hashed password for LOCAL authentication.
	 *
	 * @remarks
	 * - Never store or expose plain-text passwords
	 * - Always null for OAuth-based accounts
	 */
	hashedPassword?: string | null;

	/**
	 * Timestamp of the last password change.
	 *
	 * @remarks
	 * - Used for security enforcement (e.g. token invalidation)
	 * - Null if the account has never set a password
	 */
	passwordChangeAt?: Date | null;

	/**
	 * Identifier of the owning user.
	 *
	 * @remarks
	 * Nullable during account provisioning or migration flows.
	 */
	userId?: string | null;

	/**
	 * Account creation timestamp.
	 */
	createdAt: Date;

	/**
	 * Account last update timestamp.
	 */
	updatedAt: Date;
}

/**
 * Core user domain model.
 *
 * @remarks
 * - Represents an authenticated identity within the system
 * - Contains only security-critical and system-level fields
 * - Public or user-editable data must live outside this model
 */
export interface User {
	/**
	 * Primary user identifier.
	 */
	id: string;

	/**
	 * Unique email address used for authentication and communication.
	 */
	email: string;

	/**
	 * User role within the system.
	 */
	role: Role;

	/**
	 * Indicates whether the user account is active.
	 *
	 * @remarks
	 * Inactive users should be denied authentication and access.
	 */
	isActive: boolean;

	/**
	 * Indicates whether the user's email address has been verified.
	 */
	isEmailVerified: boolean;

	/**
	 * User creation timestamp.
	 */
	createdAt: Date;

	/**
	 * User last update timestamp.
	 */
	updatedAt: Date;
}

/**
 * User model with resolved relations.
 *
 * @remarks
 * - Intended for internal, service-level, or admin usage
 * - Aggregates identity, authentication, and domain ownership
 * - Must never be returned directly to public or client-facing APIs
 */
export interface UserWithRelations extends User {
	/**
	 * Linked authentication accounts.
	 *
	 * @remarks
	 * Includes LOCAL and OAuth-based providers.
	 */
	account: Account[];

	/**
	 * User profile containing public and user-editable information.
	 */
	profile?: Profile | null;

	/**
	 * Authentication tokens associated with the user.
	 */
	userToken: UserToken[];

	/**
	 * Domain-owned resources.
	 *
	 * @remarks
	 * Ownership is enforced at the user level.
	 */
	bags: Bag[];
	suitcases: Suitcase[];
	items: Item[];
}

/**
 * Allowed user ordering fields.
 *
 * @remarks
 * - Defines the whitelist of sortable fields for user list endpoints
 * - Prevents arbitrary or unsafe ordering inputs
 * - Designed to be consumed by a shared `orderBy` schema builder
 */
export enum UserOrderByField {
	CREATED_AT = 'createdAt',
	UPDATED_AT = 'updatedAt',
	EMAIL = 'email',
	ROLE = 'role',
}

// ─────────────────────────────────────────────
// Schemas with identical input & output
// (No transforms → input === payload)
//
// Frontend uses Input types only
// Services only accept Payload types
// ─────────────────────────────────────────────

// ==================================================
// ADMIN SCHEMA
// ==================================================
// These types belong to privileged administrative actions
// Require elevated permissions

export type ChangeRoleInput = z.infer<typeof AdminSchema.changeRole>;

export type UpdateStatusInput = z.infer<typeof AdminSchema.updateStatus>;

// ─────────────────────────────────────────────
// Schemas with transformations
// (Input ≠ Payload due to `.transform()`)
// ─────────────────────────────────────────────
// What the client submits (Frontend / form layer)
// Includes fields like `confirmPassword`

// ==================================================
// ADMIN SCHEMA — INPUT
// ==================================================
// Admin-submitted data before transformations
// Includes confirmation fields for UX only

export type CreateUserInput = z.input<typeof AdminSchema.createUser>;

// ==================================================
// What the API / service layer receives
// Safe, validated, and stripped of sensitive fields
// ==================================================

// ==================================================
// ADMIN SCHEMA — PAYLOAD
// ==================================================
// Privileged, sanitized admin data
// Safe to pass directly into services / DB layer

type Override<Base, Overrides extends Partial<Base>> = Omit<
	Base,
	keyof Overrides
> &
	Overrides;

export type CreateUserPayload = Override<
	z.output<typeof AdminSchema.createUser>,
	{
		firstName: string;
		lastName: string;
		email: string;
		password: string;
	}
>;
