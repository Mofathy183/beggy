'use client';

import { useCallback } from 'react';
import { useAppDispatch } from '@shared/store';
import { authApi } from '@features/auth/api';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface UseProfileSyncWithAuthResult {
	/**
	 * Force-refetches GET /auth/me, which re-runs `onQueryStarted` in authApi
	 * and dispatches `setAuthenticated` — updating authSlice.profile,
	 * authSlice.user, and the CASL ability slice in one shot.
	 *
	 * Fire-and-forget: no need to await in UI code.
	 */
	syncProfile: () => void;
}

// ─── Hook ────────────────────────────────────────────────────────────────────

/**
 * useProfileSyncWithAuth
 *
 * Returns a `syncProfile` function that pushes the latest profile data
 * from the server into authSlice after a successful settings edit.
 *
 * @remarks
 * When to use this hook vs not:
 *
 * USE when your AppShell (header, sidebar) reads displayName or avatarUrl
 * from authSlice — common because authSlice is always available without
 * a separate RTK Query subscription.
 *
 * SKIP when your components only read from `usePrivateProfile()` (the RTK
 * Query cache) — `editProfile` already invalidates the 'Profile' tag so
 * those components re-fetch automatically.
 *
 * Do NOT use in the onboarding flow — `useOnboarding` handles the
 * /auth/me re-fetch internally as part of its 3-step sequence.
 *
 * @example
 * const { syncProfile } = useProfileSyncWithAuth();
 *
 * const { submit } = useEditProfile({
 *   onSuccess: () => {
 *     // Sync authSlice so the sidebar avatar/name updates immediately
 *     syncProfile();
 *     toast({ title: 'Profile updated!' });
 *   },
 * });
 */
const useProfileSyncWithAuth = (): UseProfileSyncWithAuthResult => {
	const dispatch = useAppDispatch();

	const syncProfile = useCallback(() => {
		// forceRefetch: true bypasses the RTK Query cache so authSlice
		// always receives fresh data from the server, not a stale cache hit.
		dispatch(
			authApi.endpoints.me.initiate(undefined, { forceRefetch: true })
		);
	}, [dispatch]);

	return { syncProfile };
};

export default useProfileSyncWithAuth;
