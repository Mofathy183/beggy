/**
 * 👤 PROFILES — User-Facing Identity
 *
 * The Profiles domain represents how users present themselves
 * to other users and to the public.
 *
 * Profiles are:
 * - Separate from authentication
 * - Editable by the owning user
 * - Publicly readable where allowed
 *
 * ------------------------------------------------------------------
 * Private Profile (Authenticated)
 * ------------------------------------------------------------------
 *
 * GET /profiles/me
 * - Returns the authenticated user's private profile
 * - Requires authentication
 *
 * PATCH /profiles/me
 * - Updates the authenticated user's profile
 * - Accepts structured JSON data only (e.g. first and last name, birthDate, avatarUrl)
 *
 * The /me pattern avoids exposing internal user IDs
 * and simplifies frontend logic.
 *
 * ------------------------------------------------------------------
 * Public Profile
 * ------------------------------------------------------------------
 *
 * GET /profiles/:id
 * - Returns a user's public profile by ID
 * - Accessible without authentication
 * - Does NOT expose private or sensitive fields
 *
 * Public vs private access is intentionally explicit
 * to avoid accidental data leakage.
 */
import { Router } from 'express';

import { Action, Subject } from '@beggy/shared/constants';
import { ProfileSchema } from '@beggy/shared/schemas';

import { ProfileController } from '@modules/profiles';
import {
	requireAuth,
	requirePermission,
	validateBody,
	validateUuidParam,
} from '@shared/middlewares';

/**
 * Factory function for the Profile router.
 *
 * @remarks
 * - Uses dependency injection for the controller
 * - Makes the router easily testable
 * - Prevents hidden singletons
 *
 * @param profileController - Controller handling profile HTTP actions
 */
export const createProfileRouter = (
	profileController: ProfileController
): Router => {
	const router = Router();

	/**
	 * GET /profiles/me
	 *
	 * Returns the authenticated user's private profile.
	 *
	 * Security:
	 * - Requires authentication
	 * - Requires READ permission on PROFILE
	 *
	 * This endpoint intentionally avoids exposing user IDs.
	 */
	router.get(
		'/me',
		requireAuth,
		requirePermission(Action.READ, Subject.PROFILE),
		profileController.getPrivateProfile
	);

	/**
	 * GET /profiles/:id
	 *
	 * Returns a user's public profile by profile ID.
	 *
	 * Notes:
	 * - Publicly accessible
	 * - Only exposes whitelisted public fields
	 * - UUID is validated at the router level
	 */
	router.get('/:id', validateUuidParam, profileController.getPublicProfile);

	/**
	 * PATCH /profiles/me
	 *
	 * Updates the authenticated user's profile.
	 *
	 * Security:
	 * - Requires authentication
	 * - Requires UPDATE permission on PROFILE
	 *
	 * Validation:
	 * - Request body is validated via Zod schema
	 * - Supports partial updates (PATCH semantics)
	 */
	router.patch(
		'/me',
		requireAuth,
		requirePermission(Action.UPDATE, Subject.PROFILE),
		validateBody(ProfileSchema.editProfile),
		profileController.updateUserProfile
	);

	return router;
};
