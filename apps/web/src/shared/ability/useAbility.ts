'use client';

import { useMemo } from 'react';
import { useAppSelector } from '@shared/store';
import { type AppAbility, defineAbilityForUser } from '@/shared/ability';

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
 * Returns a stable CASL ability instance representing the current
 * user's permissions, kept in sync with Redux.
 *
 * Uses useState with a lazy initializer instead of useRef to avoid
 * the react-hooks/refs ESLint rule that forbids reading ref.current
 * during render. useState's lazy initializer runs once on mount,
 * giving us the same stable-instance guarantee without the lint error.
 *
 * Permission changes update rules via ability.update() — the instance
 * identity stays stable so consumers don't re-render unnecessarily.
 *
 * Returns a CASL ability instance derived from the current Redux permissions.
 *
 * Architecture shift from the previous implementation:
 * - Previous: stable mutating instance + useEffect + setState hack to trigger re-renders
 * - Now: useMemo derives a new ability whenever permissions change
 *
 * Why this is correct:
 * - useMemo is the right primitive for "derived value from state"
 * - No effects, no setState, no ESLint violations
 * - React re-renders consumers automatically when permissions change
 *   (because the memo reference changes → new ability object → re-render)
 * - CASL ability instances are cheap to construct — no perf concern
 *
 * Trade-off acknowledged:
 * - We lose the stable-identity guarantee (ability reference changes on permission update)
 * - This means ability.on('update') subscriptions won't work here
 * - That's acceptable: we don't use CASL event subscriptions in this codebase
 *   and the sidebar/Can components only call ability.can(), which is stateless
 *
 * @returns An {@link AppAbility} instance reflecting current user permissions
 * @returns A stable {@link AppAbility} instance
 *
 * @example
 * ```ts
 * const ability = useAbility();
 * ability.can(Action.UPDATE, Subject.BAG);
 * ```
 */
const useAbility = (): AppAbility => {
	const permissions = useAppSelector((s) => s.ability.permissions);

	const ability = useMemo(() => {
		return defineAbilityForUser(permissions);
	}, [permissions]);

	return ability;
};

export default useAbility;
