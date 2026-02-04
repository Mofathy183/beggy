import { useMemo } from 'react';
import { useAppSelector } from '@shared/store';
import { defineAbilityForUser } from '@shared/store/ability';

/**
 * Hook that returns the current CASL ability instance for the logged-in user.
 *
 * @remarks
 * - Ability is derived **only** from permissions stored in Redux
 * - Ability is memoized to avoid unnecessary re-instantiation
 * - Permissions are treated as the single source of truth
 *
 * @returns A memoized `AppAbility` instance representing user permissions
 *
 * @example
 * ```ts
 * const ability = useAbility();
 * ability.can(Action.UPDATE, Subject.BAG);
 * ```
 */
export const useAbility = () => {
	const permissions = useAppSelector((s) => s.ability.permissions);
	/**
	 * Rebuild ability only when permissions change.
	 * This keeps permission checks cheap and predictable.
	 */
	return useMemo(() => defineAbilityForUser(permissions), [permissions]);
};
