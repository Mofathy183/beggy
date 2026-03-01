'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '@shared/store';

/**
 * useAuthRedirect
 *
 * Watches authSlice for authentication state changes and redirects
 * the user to the correct destination after login or signup.
 *
 * Redirect logic:
 *  - Not initialized          → wait  (bootstrap still in progress)
 *  - Not authenticated        → wait  (AuthGate handles unauthenticated routes)
 *  - Authenticated, no profile → /onboarding  (new user / OAuth first login)
 *  - Authenticated, has profile → /dashboard  (returning user)
 *
 * @remarks
 * Called inside `useLogin` and `useSignup` — NOT directly in components.
 * Keeping redirect logic here prevents forms from owning routing decisions.
 *
 * The `profile` field in authSlice is `AuthMeProfileDTO | null` — it is null
 * when the user has never completed onboarding. `useOnboarding` re-fetches
 * /auth/me after saving the profile, setting this field to non-null so
 * subsequent logins land on /dashboard directly.
 */
const useAuthRedirect = () => {
	const router = useRouter();
	const { status, initialized, profile } = useAppSelector((s) => s.auth);

	useEffect(() => {
		// Wait until bootstrap has completed at least once
		if (!initialized || status !== 'authenticated') return;

		if (profile === null) {
			// New user or OAuth first login — profile not yet created
			router.replace('/onboarding');
			return;
		}

		// Returning user with a complete profile
		router.replace('/dashboard');
	}, [initialized, status, profile, router]);
};

export default useAuthRedirect;
