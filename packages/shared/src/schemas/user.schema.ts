import * as z from 'zod';
import { FieldsSchema } from '@/schemas';
import { Gender, Role } from '@/types';

/**
 * User profile–related validation schemas.
 *
 * @remarks
 * - Covers authenticated, self-service profile operations
 * - Designed for use with `/profile/me`–style endpoints
 * - Uses Zod `strictObject` to prevent mass-assignment vulnerabilities
 * - Shared between web forms and API endpoints for consistency
 * - Validation occurs at the boundary; persistence rules are enforced separately
 */
export const ProfileSchema = {
	/**
	 * Edit-profile schema.
	 *
	 * @remarks
	 * - Used when an authenticated user updates their own profile
	 * - All fields are optional to support partial updates (PATCH semantics)
	 * - No default values are applied to avoid unintended data overwrites
	 * - Fields not provided in the payload remain unchanged
	 */
	editProfile: z.strictObject({
		/**
		 * User first name.
		 *
		 * @remarks
		 * - Optional to allow partial updates
		 * - Validated using shared name constraints
		 * - Intended for personal identification and UI display
		 */
		firstName: FieldsSchema.name('First Name', 'person', false),

		/**
		 * User last name.
		 *
		 * @remarks
		 * - Optional to allow partial updates
		 * - Uses the same validation rules as first name
		 * - Stored and displayed as part of the public profile
		 */
		lastName: FieldsSchema.name('Last Name', 'person', false),

		/**
		 * Public avatar image URL.
		 *
		 * @remarks
		 * - Optional profile picture reference
		 * - Expected to point to an externally managed resource (e.g. CDN)
		 * - Validation ensures a well-formed URL only
		 */
		avatarUrl: FieldsSchema.url(false),

		/**
		 * Optional gender selection.
		 *
		 * @remarks
		 * - Stored as an enum for consistency and safety
		 * - Not required for core functionality
		 * - Intended for personalization or future AI-driven features
		 * - Should be handled carefully in downstream consumers
		 */
		gender: FieldsSchema.enum<typeof Gender>(Gender, false),

		/**
		 * User date of birth.
		 *
		 * @remarks
		 * - Optional field used for derived values (e.g. age)
		 * - Raw date is validated but should be treated as sensitive data
		 * - Downstream layers should avoid exposing this directly to clients
		 */
		birthDate: FieldsSchema.date(false),

		/**
		 * User country.
		 *
		 * @remarks
		 * - Optional location field
		 * - Used for regional features (e.g. weather, localization)
		 * - Validated as a human-readable place name
		 */
		country: FieldsSchema.name('Country', 'place', false),

		/**
		 * User city.
		 *
		 * @remarks
		 * - Optional location field
		 * - Often paired with country for location-based features
		 * - Free-text but constrained via shared validation rules
		 */
		city: FieldsSchema.name('City', 'place', false),
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
