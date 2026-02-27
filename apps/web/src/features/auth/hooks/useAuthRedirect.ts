'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '@shared/store';

/**
 * useAuthRedirect
 *
 * Watches authSlice for authentication state changes and redirects
 * the user to the appropriate destination.
 *
 * Redirect logic:
 *  - profile === null → /onboarding  (new user or OAuth first login)
 *  - profile !== null → /dashboard   (returning user)
 *
 * Called inside useLogin and useSignup — not in components directly.
 * This keeps routing logic out of forms entirely.
 *
 * NOTE: profile check is stubbed until profiles feature is built.
 * When profiles exist, uncomment the profile === null branch.
 */
const useAuthRedirect = () => {
	const router = useRouter();
	const { status, initialized } = useAppSelector((s) => s.auth);
	// const profile = useAppSelector((s) => s.auth.profile);

	useEffect(() => {
		if (!initialized || status !== 'authenticated') return;

		// TODO: uncomment when profiles feature exists
		// if (profile === null) {
		//   router.replace('/onboarding');
		//   return;
		// }

		router.replace('/dashboard');
	}, [initialized, status, router]);
};

export default useAuthRedirect;
