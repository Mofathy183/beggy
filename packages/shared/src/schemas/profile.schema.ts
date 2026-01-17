import * as z from 'zod';
import { FieldsSchema } from '../schemas/fields.schema.js';
import { Gender } from '../constants/profile.enums.js';

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
