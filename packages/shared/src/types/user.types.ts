/**
 * API Response Types for User
 * These types represent the data structure returned from the API endpoints.
 * They are derived from Prisma models but tailored for API responses.
 */
import type * as z from 'zod';
import { type AdminSchema } from '../schemas/user.schema.js';
import type { Role } from '../constants/auth.enums.js';
import type { Override, ISODateString } from './index.js';

/**
 * Core user domain model.
 *
 * @remarks
 * - Represents an authenticated identity within the system
 * - Contains only security-critical and system-level fields
 * - Public or user-editable data must live outside this model
 */
export interface UserDTO {
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
	 * User creation ISODateString.
	 */
	createdAt: ISODateString;

	/**
	 * User last update ISODateString.
	 */
	updatedAt: ISODateString;
}

export interface AdminUserDTO extends UserDTO {
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

export type ChangeRoleInput = Override<
	z.infer<typeof AdminSchema.changeRole>,
	{ role: Role }
>;

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

export type CreateUserInput = Override<
	z.input<typeof AdminSchema.createUser>,
	{
		firstName: string;
		lastName: string;
		email: string;
		password: string;
		confirmPassword: string;
	}
>;

// ==================================================
// What the API / service layer receives
// Safe, validated, and stripped of sensitive fields
// ==================================================

// ==================================================
// ADMIN SCHEMA — PAYLOAD
// ==================================================
// Privileged, sanitized admin data
// Safe to pass directly into services / DB layer

export type CreateUserPayload = Override<
	z.output<typeof AdminSchema.createUser>,
	{
		firstName: string;
		lastName: string;
		email: string;
		password: string;
	}
>;
