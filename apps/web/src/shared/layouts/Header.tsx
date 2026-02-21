'use client';

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useLogout } from '@shared/hooks';
import { ThemeToggle } from '@shadcn-components';
import { useGetPrivateProfileQuery } from '@features/profiles';
import HeaderUI from './HeaderUI';
import type { ProfileDTO, PublicProfileDTO } from '@beggy/shared/types';

// ─── Profile mapping ──────────────────────────────────────────────────────────

/**
 * Maps the full ProfileDTO returned by the API into the subset
 * that HeaderUI needs (PublicProfileDTO).
 *
 * This keeps HeaderUI decoupled from the full ProfileDTO shape.
 * If ProfileDTO gains new fields in the future, nothing here breaks.
 *
 * Returns null when the profile query has not resolved yet or the
 * user is not authenticated — HeaderUI will render in guest mode.
 */
const toPublicProfile = (data: ProfileDTO): PublicProfileDTO | null => {
	if (!data) return null;

	return {
		id: data.id,
		firstName: data.firstName,
		lastName: data.lastName,
		avatarUrl: data.avatarUrl ?? null,
		country: data.country ?? null,
		city: data.city ?? null,
		displayName: data.displayName ?? null,
		age: data.age ?? null,
	};
};

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
	const { data: profileData } = useGetPrivateProfileQuery();

	const profile = toPublicProfile(profileData?.data as ProfileDTO);

	// ── useLogout ────────────────────────────────────────────────────────
	//
	// useLogout returns an async function directly (not `{ logout }`).
	// Calling it: calls the logout mutation, clears permissions,
	// resets RTK Query cache, then redirects to /login.
	const logout = useLogout();

	// ── Handlers ────────────────────────────────────────────────────────

	const handleProfileClick = useCallback(() => {
		router.push('/dashboard/profile');
	}, [router]);

	const handleSettingsClick = useCallback(() => {
		router.push('/dashboard/settings');
	}, [router]);

	const handleLogout = useCallback(async () => {
		await logout();
	}, [logout]);

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
			onLogout={handleLogout}
			onLoginClick={handleLoginClick}
			onSignUpClick={handleSignUpClick}
			themeToggle={<ThemeToggle />}
		/>
	);
};

export default Header;
