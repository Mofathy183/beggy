import { AbilityBuilder, AbilityClass, PureAbility } from '@casl/ability';
import { Action, Subject } from '@beggy/shared/constants';
import type { Permissions } from '@beggy/shared/types';

/**
 * Application-wide CASL ability type.
 *
 * @remarks
 * - Uses tuple-based ability checks: `[Action, Subject]`
 * - Scoped ownership checks are enforced by the API, not the UI
 */
export type AppAbility = PureAbility<[Action, Subject]>;

/**
 * Explicit ability class reference required by CASL's AbilityBuilder.
 */
export const AppAbilityClass = PureAbility as AbilityClass<AppAbility>;

/**
 * Build a CASL ability instance from backend-provided permissions.
 *
 * @param permissions - Flat list of permissions returned from `/auth/me`
 *
 * @remarks
 * - No role-based logic here
 * - No defaults or fallbacks
 * - Frontend does NOT infer or elevate permissions
 *
 * @returns A fully built CASL ability instance
 */
export const defineAbilityForUser = (permissions: Permissions): AppAbility => {
	const { can, build } = new AbilityBuilder(AppAbilityClass);

	/**
	 * Register each permission as-is.
	 * Backend remains the single authority.
	 */
	permissions.forEach(({ action, subject }) => {
		can(action, subject);
	});

	return build();
};
