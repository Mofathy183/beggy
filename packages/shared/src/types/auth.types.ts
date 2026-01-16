import type { User } from '../types/user.types.js';
import { AuthSchema } from '../schemas/auth.schema.js';
import * as z from 'zod';
import type { Override } from './index.js';

/**
 * Application-level user roles.
 *
 * @remarks
 * - Roles define **permission bundles**, not behavior
 * - Changing a role's capabilities should be done via permissions,
 *   not conditionals in business logic
 */
export enum Role {
	ADMIN = 'ADMIN',
	MEMBER = 'MEMBER',
	MODERATOR = 'MODERATOR',
	USER = 'USER',
}

/**
 * Supported authentication providers.
 *
 * @remarks
 * - Defines how a user authenticates with the system
 * - Used for login flows, account linking, and security auditing
 * - Designed to be safely extendable (e.g. APPLE, GITHUB) without
 *   breaking existing users or accounts
 */
export enum AuthProvider {
	/**
	 * Google OAuth provider.
	 */
	GOOGLE = 'GOOGLE',

	/**
	 * Facebook OAuth provider.
	 */
	FACEBOOK = 'FACEBOOK',

	/**
	 * Native email/password authentication.
	 */
	LOCAL = 'LOCAL',
}

/**
 * Types of one-time or short-lived tokens.
 *
 * @remarks
 * - Used for security-sensitive workflows
 * - Each type usually has a different expiration policy
 */
export enum TokenType {
	EMAIL_VERIFICATION = 'EMAIL_VERIFICATION',
	PASSWORD_RESET = 'PASSWORD_RESET',
	CHANGE_EMAIL = 'CHANGE_EMAIL',
}

/**
 * Domain entities that can be protected by permissions.
 *
 * @remarks
 * - Acts as the RBAC "resource" identifier
 * - Should map closely to API models or bounded contexts
 */
export enum Subject {
	USER = 'USER',
	BAG = 'BAG',
	ITEM = 'ITEM',
	SUITCASE = 'SUITCASE',
	ROLE = 'ROLE',
	PERMISSION = 'PERMISSION',
}

/**
 * Scope of a permission.
 *
 * @remarks
 * - OWN: resource is owned by the current user
 * - ANY: applies globally across all resources
 */
export enum Scope {
	OWN = 'OWN',
	ANY = 'ANY',
}

/**
 * Actions that can be performed on a subject.
 *
 * @remarks
 * - MANAGE is a super-action that implies all CRUD operations
 * - Useful for reducing permission verbosity
 */
export enum Action {
	CREATE = 'CREATE',
	READ = 'READ',
	UPDATE = 'UPDATE',
	DELETE = 'DELETE',
	MANAGE = 'MANAGE',
}

/**
 * A list of permissions assigned to a role or user.
 */
export type Permissions = {
	action: Action;
	scope: Scope;
	subject: Subject;
}[];

/* -------------------------------------------------------------------------- */
/*                               MODEL INTERFACES                             */
/* -------------------------------------------------------------------------- */

/**
 * Represents a user-issued token stored in persistence.
 *
 * @remarks
 * - Tokens should always be stored as **hashed values**
 * - Never expose `hashToken` to clients
 */
export interface UserToken {
	id: string;
	type: TokenType;
	hashToken: string;
	expiresAt: Date;
	createdAt: Date;

	/**
	 * Owning user identifier
	 */
	userId: string;

	/**
	 * Related user entity
	 */
	user: User;
}

/**
 * Atomic permission definition.
 *
 * @remarks
 * - This is the canonical RBAC rule
 * - Roles are composed by grouping these permissions
 */
export interface Permission {
	/**
	 * Primary identifier
	 */
	id: string;

	/**
	 * The action being allowed
	 */
	action: Action;

	/**
	 * Whether the permission applies to OWN or ANY resource
	 */
	scope: Scope;

	/**
	 * The resource type this permission applies to
	 */
	subject: Subject;
}

/**
 * Join table mapping roles to permissions.
 *
 * @remarks
 * - Enables many-to-many relationships
 * - Allows dynamic permission assignment without code changes
 */
export interface RoleOnPermission {
	/**
	 * Primary identifier
	 */
	id: string;

	/**
	 * Role assigned in this mapping
	 */
	role: Role;

	/**
	 * Foreign key reference to Permission
	 */
	permissionId: string;
}

/**
 * Permission with its associated role mappings.
 *
 * @remarks
 * Useful for admin panels and permission audits.
 */
export interface PermissionWithRelations extends Permission {
	rolePermissions: RoleOnPermission[];
}

/**
 * Role-permission mapping with the resolved permission entity.
 *
 * @remarks
 * Commonly used when loading role capabilities at runtime.
 */
export interface RoleOnPermissionWithRelations extends RoleOnPermission {
	permission: Permission;
}

// ─────────────────────────────────────────────
// Schemas with identical input & output
// (No transforms → input === payload)
//
// Frontend uses Input types only
// Services only accept Payload types
// ─────────────────────────────────────────────

// ==================================================
// AUTH SCHEMA
// ==================================================
// These types belong to authentication & access flows
// Used by both frontend forms and auth services

export type LoginInput = Override<
	z.infer<typeof AuthSchema.login>,
	{
		email: string;
		password: string;
	}
>;

export type ForgotPasswordInput = Override<
	z.infer<typeof AuthSchema.forgotPassword>,
	{
		email: string;
	}
>;

export type ChangeEmailInput = Override<
	z.infer<typeof AuthSchema.changeEmail>,
	{
		email: string;
	}
>;

export type SendVerificationEmailInput = Override<
	z.infer<typeof AuthSchema.sendVerificationEmail>,
	{
		email: string;
	}
>;

// ─────────────────────────────────────────────
// Schemas with transformations
// (Input ≠ Payload due to `.transform()`)
// ─────────────────────────────────────────────
// What the client submits (Frontend / form layer)
// Includes fields like `confirmPassword`

// ==================================================
// AUTH SCHEMA — INPUT
// ==================================================
// Raw user-submitted data from auth-related forms
// May include confirmation or helper fields

export type SignUpInput = Override<
	z.input<typeof AuthSchema.signUp>,
	{
		firstName: string;
		lastName: string;
		email: string;
		password: string;
		confirmPassword: string;
	}
>;

export type ResetPasswordInput = Override<
	z.input<typeof AuthSchema.resetPassword>,
	{
		password: string;
		confirmPassword: string;
	}
>;

export type ChangePasswordInput = Override<
	z.input<typeof AuthSchema.changePassword>,
	{
		confirmPassword: string;
		currentPassword: string;
		newPassword: string;
	}
>;
export type SetPasswordInput = Override<
	z.input<typeof AuthSchema.setPassword>,
	{
		confirmPassword: string;
		newPassword: string;
	}
>;

// ==================================================
// What the API / service layer receives
// Safe, validated, and stripped of sensitive fields
// ==================================================

// ==================================================
// AUTH SCHEMA — PAYLOAD
// ==================================================
// Fully validated, normalized auth data
// Ready for services, hashing, persistence

export type SignUpPayload = Override<
	z.output<typeof AuthSchema.signUp>,
	{
		firstName: string;
		lastName: string;
		email: string;
		password: string;
	}
>;

export type ResetPasswordPayload = Override<
	z.output<typeof AuthSchema.resetPassword>,
	{
		password: string;
	}
>;

export type ChangePasswordPayload = Override<
	z.output<typeof AuthSchema.changePassword>,
	{
		currentPassword: string;
		newPassword: string;
	}
>;

export type SetPasswordPayLoad = Override<
	z.output<typeof AuthSchema.setPassword>,
	{
		newPassword: string;
	}
>;
