import * as z from 'zod';
import { FieldsSchema } from '../schemas/fields.schema';
import { Role } from '../constants/auth.enums';
import { Gender } from '../constants/profile.enums';

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

			/** Optional Avatar URL */
			avatarUrl: FieldsSchema.url(false),

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
					message:
						'Those passwords don’t quite match — like two tickets with different names. Let’s double-check and make sure they travel together.',
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
		.transform(({ confirmPassword: _confirmPassword, ...rest }) => rest),

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

	/**
	 * Update user account status schema.
	 *
	 * @remarks
	 * - Used by administrators to control a user's operational and trust state
	 * - Intended for moderation, enforcement, and manual verification workflows
	 * - Not exposed to self-service user endpoints
	 */
	updateStatus: z
		.strictObject({
			/**
			 * Indicates whether the user account is active.
			 *
			 * @remarks
			 * - When `false`, the user should be prevented from authenticating
			 * - Used for suspensions, bans, or temporary deactivation
			 * - Business logic should enforce access restrictions downstream
			 */
			isActive: z.boolean().optional(),

			/**
			 * Indicates whether the user's email address is verified.
			 *
			 * @remarks
			 * - Represents an administrative trust decision
			 * - May be set manually in support or moderation scenarios
			 * - Should not imply ownership of the email without verification evidence
			 */
			isEmailVerified: z.boolean().optional(),
		})
		/**
		 * Structural validation.
		 *
		 * @remarks
		 * - Prevents empty PATCH requests
		 * - Ensures at least one status field is provided
		 * - Avoids no-op updates that would still trigger DB writes and audit logs
		 */
		.refine((data) => Object.keys(data).length > 0, {
			message:
				'Looks like there’s nothing to update just yet — pick at least one status change before we move forward, so the system knows what’s new.',
		}),
};
