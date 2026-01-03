import * as z from 'zod';
import { FieldsSchema } from '@/schemas';
import { Gender, Role } from '@/types';

/**
 * User-related validation schemas.
 *
 * @remarks
 * - Covers authenticated self-service user actions
 * - Uses Zod strict objects to prevent mass-assignment
 * - Shared between web forms and API endpoints
 * - Sensitive fields are validated but never persisted
 */
export const UserSchema = {
	/**
	 * Edit-profile schema.
	 *
	 * @remarks
	 * - Used when an authenticated user updates their profile information
	 * - All fields are optional to support partial updates
	 * - No defaults are applied to avoid unintended overwrites
	 */
	editProfile: z.strictObject({
		/** Updated first name */
		firstName: FieldsSchema.name('First Name', 'person', false),

		/** Updated last name */
		lastName: FieldsSchema.name('Last Name', 'person', false),

		/** Optional profile picture URL */
		profilePicture: FieldsSchema.url(false),

		/** Optional gender selection */
		gender: FieldsSchema.enum<typeof Gender>(Gender, false),

		/** Optional date of birth */
		birthDate: FieldsSchema.date(false),

		/** Optional country name */
		country: FieldsSchema.name('Country', 'place', false),

		/** Optional city name */
		city: FieldsSchema.name('City', 'place', false),
	}),

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
};

/**
 * Admin-related validation schemas.
 *
 * @remarks
 * - Used for privileged administrative actions
 * - Not accessible via self-service user flows
 * - Applies the same security and validation standards as user schemas
 */
export const AdminSchema = {
	/**
	 * Create-user schema.
	 *
	 * @remarks
	 * - Used by administrators to create new users
	 * - Follows the same password confirmation pattern as sign-up
	 * - confirmPassword is validated but never persisted
	 */
	createUser: z
		.strictObject({
			/** User’s first name */
			firstName: FieldsSchema.name('First Name', 'person'),

			/** User’s last name */
			lastName: FieldsSchema.name('Last Name', 'person'),

			/** User’s email address */
			email: FieldsSchema.email(),

			/** Initial account password */
			password: FieldsSchema.password(),

			/**
			 * Confirmation password.
			 *
			 * @remarks
			 * - Intentionally kept as a plain string
			 * - No password rules applied here (UX best practice)
			 */
			confirmPassword: z.string().trim(),

			/** Optional profile picture URL */
			profilePicture: FieldsSchema.url(false),

			/** Optional gender selection */
			gender: FieldsSchema.enum<typeof Gender>(Gender, false),

			/** Optional birth date */
			birthDate: FieldsSchema.date(false),

			/** Optional country name */
			country: FieldsSchema.name('Country', 'place', false),

			/** Optional city name */
			city: FieldsSchema.name('City', 'place', false),
		})
		/**
		 * Cross-field validation.
		 *
		 * @remarks
		 * - Ensures password and confirmPassword match
		 * - Error is attached to confirmPassword for correct UX
		 */
		.superRefine(({ confirmPassword, password }, ctx) => {
			if (password !== confirmPassword) {
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
	 * Change-role schema.
	 *
	 * @remarks
	 * - Used by administrators to modify user roles
	 * - Restricted to enum values only
	 */
	changeRole: z.strictObject({
		/** New role to assign to the user */
		role: FieldsSchema.enum<typeof Role>(Role),
	}),
};
