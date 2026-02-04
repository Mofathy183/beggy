import { AbilityBuilder, AbilityClass, PureAbility } from '@casl/ability';
import { Action, Subject } from '@beggy/shared/constants';
import type { Permissions } from '@beggy/shared/types';

/**
 * Application-wide CASL ability type.
 *
 * @remarks
 * - Uses tuple-based checks: `[Action, Subject]`
 * - Frontend authorization is **capability-based**, not role-based
 * - Ownership and scope checks are enforced by the API
 */
export type AppAbility = PureAbility<[Action, Subject]>;

/**
 * Explicit CASL ability class reference.
 *
 * Required by `AbilityBuilder` to correctly construct typed abilities.
 */
export const AppAbilityClass = PureAbility as AbilityClass<AppAbility>;

/**
 * defineAbilityForUser
 *
 * Constructs a CASL ability instance from backend-provided permissions.
 *
 * @param permissions - Flat list of permissions returned from `/auth/me`
 *
 * @remarks
 * Design principles:
 * - Backend is the **single authority** for permissions
 * - Frontend does NOT infer, merge, or elevate access
 * - No role-based shortcuts or defaults
 *
 * Security considerations:
 * - Empty permissions = zero access
 * - Permissions are applied verbatim
 * - UI authorization mirrors API authorization
 *
 * CASL configuration:
 * - Uses explicit subject detection to prevent accidental object-based checks
 * - Locks authorization to `[Action, Subject]` tuples
 *
 * @returns A fully constructed {@link AppAbility} instance
 */
export const defineAbilityForUser = (permissions: Permissions): AppAbility => {
	const { can, build } = new AbilityBuilder(AppAbilityClass);

	/**
	 * Register each permission exactly as provided by the backend.
	 *
	 * Example permission:
	 * `{ action: Action.READ, subject: Subject.USER }`
	 */
	permissions.forEach(({ action, subject }) => {
		can(action, subject);
	});

	/**
	 * Build the ability with strict subject detection.
	 *
	 * This prevents CASL from attempting to infer subjects from objects,
	 * enforcing a clear and predictable authorization model.
	 */
	return build({
		detectSubjectType: (subject) => subject as Subject,
	});
};
