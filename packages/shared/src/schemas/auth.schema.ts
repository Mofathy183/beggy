import * as z from 'zod';
import { FieldsSchema } from '@/schemas';
import { Gender } from '@/types';

/**
 * Authentication-related validation schemas.
 *
 * @remarks
 * - Uses Zod 4 strict objects for security (no unknown keys allowed)
 * - All validation logic lives in the schema layer (not services)
 * - Cross-field validation handled via `superRefine`
 * - Sensitive fields (e.g. confirmPassword) are stripped before reaching services
 */
export const AuthSchema = {
	/**
	 * Login schema.
	 *
	 * @remarks
	 * - Validates credentials
	 * - `rememberMe` defaults to false to simplify service logic
	 */
	login: z.strictObject({
		email: FieldsSchema.email(),
		password: FieldsSchema.password(),
		rememberMe: z.boolean().default(false),
	}),

	/**
	 * Sign-up (registration) schema.
	 *
	 * @remarks
	 * - Uses strict object to prevent mass-assignment attacks
	 * - `confirmPassword` is validated but never persisted
	 * - Optional profile fields are explicitly marked as optional
	 */
	signUp: z
		.strictObject({
			firstName: FieldsSchema.name('First Name', 'person'),
			lastName: FieldsSchema.name('Last Name', 'person'),
			email: FieldsSchema.email(),
			password: FieldsSchema.password(),

			/**
			 * Confirmation password.
			 *
			 * @remarks
			 * - Intentionally kept as a plain string
			 * - No password rules applied here (UX best practice)
			 */
			confirmPassword: z.string().trim(),

			profilePicture: FieldsSchema.url(false),
			gender: FieldsSchema.enum<typeof Gender>(Gender, false),
			birthDate: FieldsSchema.date(false),
			country: FieldsSchema.name('Country', 'place', false),
			city: FieldsSchema.name('City', 'place', false),
		})
		/**
		 * Cross-field validation.
		 *
		 * @remarks
		 * - Ensures password and confirmPassword match
		 * - Error is attached to `confirmPassword` for correct UX
		 */
		.superRefine(({ confirmPassword, password }, ctx) => {
			if (password !== confirmPassword) {
				ctx.addIssue({
					path: ['confirmPassword'], // Critical: Error on correct field
					code: 'custom',
					origin: 'string',
					message: '', // Add your error message here
				});
			}
		})
		/**
		 * Output transformation.
		 *
		 * @remarks
		 * - Removes confirmPassword before data reaches services or DB
		 * - Guarantees sensitive fields are never persisted
		 */
		.transform(({ confirmPassword, ...rest }) => rest),

	/**
	 * Change-email schema.
	 *
	 * @remarks
	 * - Used when a user requests to change their email address
	 * - Minimal payload for security and clarity
	 */
	changeEmail: z.strictObject({
		/** New email address */
		email: FieldsSchema.email(),
	}),

	/**
	 * Change-password schema.
	 *
	 * @remarks
	 * - Requires the current password for security
	 * - Uses confirmation pattern for UX consistency
	 * - confirmPassword is validated but never persisted
	 */
	changePassword: z
		.strictObject({
			/** User’s current password (required for verification) */
			currentPassword: FieldsSchema.password(),

			/** New password value */
			newPassword: FieldsSchema.password(),

			/**
			 * Confirmation of the new password.
			 *
			 * @remarks
			 * - Plain trimmed string
			 * - Compared against newPassword via cross-field validation
			 */
			confirmPassword: z.string().trim(),
		})
		/**
		 * Cross-field validation.
		 *
		 * @remarks
		 * - Ensures newPassword and confirmPassword match
		 * - Error is attached to confirmPassword for correct UX
		 */
		.superRefine(({ confirmPassword, newPassword }, ctx) => {
			if (newPassword !== confirmPassword) {
				ctx.addIssue({
					path: ['confirmPassword'], // Critical: error shown on correct field
					code: 'custom',
					origin: 'string',
					message: '', // Add your error message here
				});
			}
		})
		/**
		 * Output transformation.
		 *
		 * @remarks
		 * - Removes confirmPassword before data reaches services or DB
		 * - Guarantees sensitive fields are never persisted
		 */
		.transform(({ confirmPassword, ...rest }) => rest),

	/**
	 * Schema for setting a LOCAL password for OAuth-based users.
	 *
	 * @remarks
	 * - Intended for users who signed up via Google, Facebook, etc.
	 * - Enables password-based login in addition to OAuth
	 * - Does NOT handle password changes for existing LOCAL accounts
	 * - Safe to use in authenticated, OAuth-only flows
	 */
	setPassword: z
		.strictObject({
			/**
			 * New password to be set for the user.
			 *
			 * @remarks
			 * - Validated via shared password constraints
			 * - Plain text (never hashed at validation layer)
			 * - Trimmed to avoid accidental whitespace issues
			 */
			newPassword: FieldsSchema.password(),

			/**
			 * Confirmation of the new password.
			 *
			 * @remarks
			 * - Plain trimmed string
			 * - Compared against newPassword via cross-field validation
			 */
			confirmPassword: z.string().trim(),
		})
		/**
		 * Cross-field validation.
		 *
		 * @remarks
		 * - Ensures newPassword and confirmPassword match
		 * - Error is attached to confirmPassword for correct UX
		 */
		.superRefine(({ confirmPassword, newPassword }, ctx) => {
			if (newPassword !== confirmPassword) {
				ctx.addIssue({
					path: ['confirmPassword'], // Critical: error shown on correct field
					code: 'custom',
					origin: 'string',
					message: '', // Add your error message here
				});
			}
		})
		/**
		 * Output transformation.
		 *
		 * @remarks
		 * - Removes confirmPassword before data reaches services or DB
		 * - Guarantees sensitive fields are never persisted
		 */
		.transform(({ confirmPassword, ...rest }) => rest),

	/**
	 * Send-verification-email schema.
	 *
	 * @remarks
	 * - Used to trigger email verification workflows
	 * - Minimal surface area for security
	 */
	sendVerificationEmail: z.strictObject({
		/** Target email address */
		email: FieldsSchema.email(),
	}),

	/**
	 * Forgot-password schema.
	 *
	 * @remarks
	 * - Minimal surface area for security
	 * - Strict object prevents unexpected payloads
	 */
	forgotPassword: z.strictObject({
		email: FieldsSchema.email(),
	}),

	/**
	 * Reset-password schema.
	 *
	 * @remarks
	 * - Same password confirmation pattern as sign-up
	 * - confirmPassword is validated but never persisted
	 */
	resetPassword: z
		.strictObject({
			password: FieldsSchema.password(),
			confirmPassword: z.string().trim(),
		})
		/**
		 * Cross-field validation.
		 *
		 * @remarks
		 * - Ensures password and confirmPassword match
		 * - Error is attached to `confirmPassword` for correct UX
		 */
		.superRefine(({ confirmPassword, password }, ctx) => {
			if (password !== confirmPassword) {
				ctx.addIssue({
					path: ['confirmPassword'], // Critical: Error on correct field
					code: 'custom',
					origin: 'string',
					message: '', // Add your error message here
				});
			}
		})
		/**
		 * Output transformation.
		 *
		 * @remarks
		 * - Removes confirmPassword before data reaches services or DB
		 * - Guarantees sensitive fields are never persisted
		 */
		.transform(({ confirmPassword, ...rest }) => rest),
};
