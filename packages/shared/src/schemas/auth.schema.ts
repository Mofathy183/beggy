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
