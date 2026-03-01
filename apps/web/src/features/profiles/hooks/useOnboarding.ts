'use client';

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useEditProfileMutation } from '@features/profiles/api';
import { authApi } from '@features/auth/api/auth.api';
import { useAppDispatch } from '@shared/store';
import type { EditProfileInput } from '@beggy/shared/types';
import type { HttpClientError } from '@shared/types';

// ─── Types ────────────────────────────────────────────────────────────────────

/**
 * Options accepted by useOnboarding.
 */
export interface UseOnboardingOptions {
	/**
	 * Override the redirect destination after onboarding completes.
	 * Defaults to '/dashboard'.
	 */
	redirectTo?: string;
}

/**
 * Return shape of useOnboarding.
 */
export interface UseOnboardingResult {
	/**
	 * Pass directly to React Hook Form's handleSubmit.
	 *
	 * Executes the 3-step onboarding sequence:
	 *  1. PATCH /profiles/me   → persist profile data
	 *  2. GET  /auth/me        → re-bootstrap authSlice (profile → non-null)
	 *  3. router.replace()     → navigate to dashboard
	 */
	submit: (data: EditProfileInput) => Promise<void>;
	/**
	 * True while either step 1 (PATCH) or step 2 (/auth/me) is in-flight.
	 * Use this to disable the submit button and show a loading indicator.
	 */
	isLoading: boolean;
	/**
	 * Normalized HttpClientError from baseQuery — null when no error.
	 *
	 * Only reflects errors from step 1 (PATCH /profiles/me).
	 * Step 2 (/auth/me) errors are silent — the user is still onboarded
	 * even if authSlice sync fails; they'll see stale state until next load.
	 *
	 * Components read:
	 *   error?.body.message     — user-facing message
	 *   error?.body.suggestion  — user-facing suggestion
	 */
	error: HttpClientError | null;
	/** Reset mutation error state */
	reset: () => void;
}

// ─── Hook ────────────────────────────────────────────────────────────────────

/**
 * useOnboarding
 *
 * Orchestrates the complete onboarding submit flow.
 *
 * @remarks
 * Why re-fetch /auth/me after PATCH /profiles/me?
 *
 * `authSlice.profile` is the lightweight `AuthMeProfileDTO` populated
 * exclusively by /auth/me. The `OnboardingLayout` guard checks this field:
 *
 *   if (status === 'authenticated' && profile !== null) router.replace('/dashboard')
 *
 * After PATCH /profiles/me the guard still sees `profile === null` because
 * authSlice hasn't updated. Without the /auth/me re-fetch the user would
 * be redirected back to /onboarding on next render.
 *
 * The 3-step sequence is therefore:
 *  1. PATCH /profiles/me   → profile data persisted
 *  2. GET  /auth/me        → authSlice.profile becomes non-null
 *  3. router.replace()     → explicit navigation (faster than waiting for guard)
 *
 * This hook is intentionally NOT re-used for settings edits.
 * `useEditProfile` handles those — settings edits do not affect the guard.
 *
 * @example
 * const { submit, isLoading, error } = useOnboarding();
 *
 * // Wire to RHF
 * <form onSubmit={handleSubmit(submit)}>
 *
 * // Custom redirect
 * const { submit } = useOnboarding({ redirectTo: '/dashboard/bags' });
 */
const useOnboarding = (options?: UseOnboardingOptions): UseOnboardingResult => {
	const router = useRouter();
	const dispatch = useAppDispatch();
	const redirectTo = options?.redirectTo ?? '/dashboard';

	const [editProfile, { isLoading, error: rawError, reset }] =
		useEditProfileMutation();

	const submit = useCallback(
		async (data: EditProfileInput) => {
			// ── Step 1: Persist the profile ───────────────────────────────────
			// .unwrap() re-throws HttpClientError on failure.
			// RHF handleSubmit catches it — the form can show error.body.message.
			await editProfile(data).unwrap();

			// ── Step 2: Re-bootstrap authSlice ────────────────────────────────
			// We dispatch the me endpoint directly (not via useMeQuery hook)
			// to avoid React subscription lifecycle issues inside a callback.
			// forceRefetch: true bypasses the RTK Query cache.
			// We intentionally do NOT await this — if it fails, the user is still
			// onboarded. The OnboardingLayout redirect will fire on next /auth/me
			// check (e.g. page reload). The router.replace below still executes.
			dispatch(
				authApi.endpoints.me.initiate(undefined, { forceRefetch: true })
			);

			// ── Step 3: Navigate to dashboard ────────────────────────────────
			// We don't wait for step 2 to resolve before navigating.
			// The dashboard layout has its own AuthGate + profile guard —
			// if authSlice hasn't updated yet, the next /auth/me call will
			// resolve it. In practice, step 2 resolves near-instantly.
			router.replace(redirectTo);
		},
		[editProfile, dispatch, router, redirectTo]
	);

	return {
		submit,
		isLoading,
		error: (rawError as HttpClientError | undefined) ?? null,
		reset,
	};
};

export default useOnboarding;
