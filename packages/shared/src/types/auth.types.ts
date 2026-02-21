import { type AuthSchema } from '../schemas/auth.schema';
import type * as z from 'zod';
import type { Override } from './index';
import type { Action, Scope, Subject } from '../constants/auth.enums';

/**
 * A list of permissions assigned to a role or user.
 */
export type Permission = {
	action: Action;
	scope: Scope;
	subject: Subject;
};

export type Permissions = Permission[];

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
