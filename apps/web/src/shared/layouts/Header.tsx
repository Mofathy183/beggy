'use client';

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useLogout } from '@features/auth/hooks';
import { notify } from '@shared/utils';
import { ThemeToggle } from '@shared-ui/theme';
import { useAppSelector } from '@shared/store';
import HeaderUI from './HeaderUI';

import type { HttpClientError } from '@shared/types';

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * Smart container for the Beggy app header.
 *
 * What this component owns:
 *  ✅ Fetches the current user's profile via RTK Query
 *  ✅ Maps ProfileDTO → PublicProfileDTO (only what HeaderUI needs)
 *  ✅ Delegates logout to the shared useLogout hook
 *  ✅ Delegates all navigation to next/navigation router
 *  ✅ Injects ThemeToggle as a render slot into HeaderUI
 *
 * What this component deliberately does NOT own:
 *  ✗ Any JSX layout — that lives entirely in HeaderUI
 *  ✗ Theme logic — ThemeToggle is self-contained
 *  ✗ An auth Redux slice — profile comes from RTK Query cache
 *
 * Why RTK Query and not a Redux slice?
 *
 * Your store only has `apiSlice` and `abilityReducer`. There is no
 * `state.auth` slice. The profile is already cached by RTK Query
 * after the first authenticated request — reading it via
 * `useGetMyProfileQuery` is the idiomatic RTK Query pattern and
 * avoids duplicating state between the API cache and a custom slice.
 *
 * The query runs only if a session cookie is present (handled server-side).
 * When the user is unauthenticated, `data` is undefined → `profile` is null
 * → HeaderUI renders in guest mode automatically.
 */
const Header = () => {
	const router = useRouter();

	// ── Profile from RTK Query cache ────────────────────────────────────
	//
	// `skip: false` means this always subscribes.
	// RTK Query will not fire a new network request if the result is
	// already in cache from an earlier call (e.g. from AuthGate).
	//
	// Adjust the hook name to match your profilesApi endpoint name.
	// Common patterns: useGetMyProfileQuery, useGetMeQuery, useGetCurrentProfileQuery
	const profile = useAppSelector((s) => s.auth.profile);

	// ── useLogout ────────────────────────────────────────────────────────
	//
	// useLogout returns an async function directly (not `{ logout }`).
	// Calling it: calls the logout mutation, clears permissions,
	// resets RTK Query cache, then redirects to /login.
	const logout = useLogout();

	const onLogout = useCallback(async () => {
		await logout({
			onSuccess: (message) => {
				notify.success({ message });
			},
			onError: (error) => {
				notify.error.fromHttp(error as HttpClientError);
			},
		});
	}, [logout]);

	// ── Handlers ────────────────────────────────────────────────────────

	const handleProfileClick = useCallback(() => {
		router.push('/profile');
	}, [router]);

	const handleSettingsClick = useCallback(() => {
		router.push('/settings');
	}, [router]);

	const handleLoginClick = useCallback(() => {
		router.push('/login');
	}, [router]);

	const handleSignUpClick = useCallback(() => {
		router.push('/signup');
	}, [router]);

	// ── Render ──────────────────────────────────────────────────────────

	return (
		<HeaderUI
			profile={profile}
			onProfileClick={handleProfileClick}
			onSettingsClick={handleSettingsClick}
			onLogout={onLogout}
			onLoginClick={handleLoginClick}
			onSignUpClick={handleSignUpClick}
			themeToggle={<ThemeToggle />}
		/>
	);
};

export default Header;
