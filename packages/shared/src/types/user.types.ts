/**
 * API Response Types for User
 * These types represent the data structure returned from the API endpoints.
 * They are derived from Prisma models but tailored for API responses.
 */
import { UserSchema, AdminSchema } from '@/schemas';
import * as z from 'zod';

import type {
	AuthProvider,
	Role,
	UserToken,
	Bag,
	Suitcase,
	Item,
} from '@/types';

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
 * External authentication account linked to a user.
 *
 * @remarks
 * - Represents OAuth / social login providers
 * - A single user may have multiple linked accounts
 * - `providerId` must be unique per provider
 */
export interface Account {
	id: string;
	// TODO: change provider to authProvider
	provider: AuthProvider;
	providerId: string;
	// TODO: move the password to the Account
	createdAt: Date;
	updatedAt: Date;
	userId: string;
}

/**
 * Core user domain model.
 *
 * @remarks
 * - Represents an authenticated identity
 * - Security-critical fields must never be exposed to clients
 */
export interface User {
	id: string;
	firstName: string;
	lastName: string;
	password: string;
	email: string;
	role: Role;
	profilePicture?: string | null;
	gender?: Gender | null;
	birthDate?: Date | null;
	country?: string | null;
	city?: string | null;
	isActive: boolean;
	isEmailVerified: boolean;
	passwordChangeAt?: Date | null;
	createdAt: Date;
	updatedAt: Date;
}

/**
 * User model with resolved relations.
 *
 * @remarks
 * - Intended for internal or admin use
 * - Should never be returned directly to public clients
 */
export interface UserWithRelations extends User {
	userToken: UserToken[];
	bags: Bag[];
	suitcases: Suitcase[];
	items: Item[];
	account: Account[];
}

/**
 * Allowed "order by" fields for User queries.
 *
 * @remarks
 * - Exposes only non-sensitive, user-facing fields
 * - Prevents sorting by internal or private user attributes
 */
export enum UserOrderByField {
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
// USER SCHEMA
// ==================================================
// These types belong to self-service user actions
// Authenticated user modifying their own data

export type EditProfileInput = z.infer<typeof UserSchema.editProfile>;
export type ChangeEmailInput = z.infer<typeof UserSchema.changeEmail>;
export type SendVerificationEmailInput = z.infer<
	typeof UserSchema.sendVerificationEmail
>;

// ==================================================
// ADMIN SCHEMA
// ==================================================
// These types belong to privileged administrative actions
// Require elevated permissions

export type ChangeRoleInput = z.infer<typeof AdminSchema.changeRole>;

// ─────────────────────────────────────────────
// Schemas with transformations
// (Input ≠ Payload due to `.transform()`)
// ─────────────────────────────────────────────
// What the client submits (Frontend / form layer)
// Includes fields like `confirmPassword`

// ==================================================
// USER SCHEMA — INPUT
// ==================================================
// User-submitted data that still needs cleanup
// (e.g. confirmPassword)

export type ChangePasswordInput = z.input<typeof UserSchema.changePassword>;

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
// USER SCHEMA — PAYLOAD
// ==================================================
// Clean, trusted user data
// Confirmation fields removed

export type ChangePasswordPayload = z.output<typeof UserSchema.changePassword>;

// ==================================================
// ADMIN SCHEMA — PAYLOAD
// ==================================================
// Privileged, sanitized admin data
// Safe to pass directly into services / DB layer

export type CreateUserPayload = z.output<typeof AdminSchema.createUser>;
