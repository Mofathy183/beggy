import { User } from '@/types';
import { AuthSchema } from '@/schemas';
import * as z from 'zod';

export enum Role {
	ADMIN = 'ADMIN',
	MEMBER = 'MEMBER',
	MODERATOR = 'MODERATOR',
	USER = 'USER',
}

export enum AuthProvider {
	GOOGLE = 'GOOGLE',
	FACEBOOK = 'FACEBOOK',
}

export enum TokenType {
	EMAIL_VERIFICATION = 'EMAIL_VERIFICATION',
	PASSWORD_RESET = 'PASSWORD_RESET',
	CHANGE_EMAIL = 'CHANGE_EMAIL',
}

export enum Subject {
	USER = 'USER',
	BAG = 'BAG',
	ITEM = 'ITEM',
	SUITCASE = 'SUITCASE',
	ROLE = 'ROLE',
	PERMISSION = 'PERMISSION',
}

export enum Scope {
	OWN = 'OWN',
	ANY = 'ANY',
}

export enum Action {
	CREATE = 'CREATE',
	READ = 'READ',
	UPDATE = 'UPDATE',
	DELETE = 'DELETE',
	MANAGE = 'MANAGE',
}

export type Permissions = { action: Action; scope: Scope; subject: Subject }[];

export interface UserToken {
	id: string;
	type: TokenType;
	hashToken: string;
	expiresAt: Date;
	createdAt: Date;
	userId: string;
	user: User;
}

export interface Permission {
	/**
	 * Primary identifier
	 */
	id: string;
	/**
	 * The action (CREATE/READ/UPDATE/DELETE/MANAGE)
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

export interface RoleOnPermission {
	/**
	 * Primary identifier
	 */
	id: string;
	/**
	 * The role assigned in this mapping
	 */
	role: Role;
	/**
	 * Foreign key to Permission
	 */
	permissionId: string;
}

export interface PermissionWithRelations extends Permission {
	rolePermissions: RoleOnPermission[];
}

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

export type LoginInput = z.infer<typeof AuthSchema.login>;
export type ForgotPasswordInput = z.infer<typeof AuthSchema.forgotPassword>;

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

export type SignUpInput = z.input<typeof AuthSchema.signUp>;
export type ResetPasswordInput = z.input<typeof AuthSchema.resetPassword>;

// ==================================================
// What the API / service layer receives
// Safe, validated, and stripped of sensitive fields
// ==================================================

// ==================================================
// AUTH SCHEMA — PAYLOAD
// ==================================================
// Fully validated, normalized auth data
// Ready for services, hashing, persistence

export type SignUpPayload = z.output<typeof AuthSchema.signUp>;
export type ResetPasswordPayload = z.output<typeof AuthSchema.resetPassword>;
