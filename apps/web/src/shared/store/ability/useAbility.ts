'use client';

import { useEffect, useRef } from 'react';
import { useAppSelector } from '@shared/store';
import { AppAbility, defineAbilityForUser } from '@shared/store/ability';

/**
 * useAbility
 *
 * Returns a **stable CASL ability instance** representing the current
 * authenticated user's permissions.
 *
 * @remarks
 * Architectural decisions:
 * - The ability instance is created **once** and preserved across renders
 * - Permission changes update rules via `ability.update()` instead of
 *   replacing the instance
 * - Permissions stored in Redux are the **single source of truth**
 *
 * Why this matters:
 * - CASL abilities are stateful and designed to be updated, not recreated
 * - Stable identity allows future subscriptions (`ability.on('update')`)
 * - Prevents permission "flashing" and stale references
 *
 * Lifecycle:
 * - Initial render → empty ability (no permissions)
 * - `/auth/me` success → permissions injected → rules updated
 * - Logout / auth failure → permissions cleared → rules reset
 *
 * @returns A stable {@link AppAbility} instance
 *
 * @example
 * ```ts
 * const ability = useAbility();
 * ability.can(Action.UPDATE, Subject.BAG);
 * ```
 */
const useAbility = (): AppAbility => {
	/**
	 * Raw permissions from Redux.
	 *
	 * This array is treated as immutable input coming from the backend.
	 */
	const permissions = useAppSelector((s) => s.ability.permissions);

	/**
	 * Persistent reference to the CASL ability instance.
	 *
	 * The ability object must remain stable across renders.
	 */
	const abilityRef = useRef<AppAbility | null>(null);

	/**
	 * Lazily initialize the ability with **no permissions**.
	 *
	 * This ensures:
	 * - Safe default state
	 * - No accidental permission leaks
	 * - Predictable behavior before auth resolution
	 */
	if (!abilityRef.current) {
		abilityRef.current = defineAbilityForUser([]);
	}

	/**
	 * Synchronize CASL rules whenever backend permissions change.
	 *
	 * Important:
	 * - We rebuild rules from scratch
	 * - We update the existing ability instance
	 * - We do NOT mutate permissions or infer rules
	 */
	useEffect(() => {
		const nextAbility = defineAbilityForUser(permissions);
		abilityRef.current?.update(nextAbility.rules);
	}, [permissions]);

	return abilityRef.current;
};

export default useAbility;
