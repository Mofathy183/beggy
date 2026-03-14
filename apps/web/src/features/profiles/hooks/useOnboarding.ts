'use client';

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useCompleteOnboardingMutation } from '@features/profiles/api';
import { authApi } from '@features/auth/api/auth.api';
import { useAppDispatch } from '@shared/store';
import type { EditProfileInput } from '@beggy/shared/types';
import type { HttpClientError } from '@shared/types';

// ─── Types ────────────────────────────────────────────────────────────────────

type OnboardingCallbacks = {
	onSuccess?: (message: string) => void;
	onError?: (error: unknown) => void;
};

export interface UseOnboardingOptions {
	/**
	 * Override the redirect destination after onboarding completes or is skipped.
	 * Defaults to '/dashboard'.
	 */
	redirectTo?: string;
}

export interface UseOnboardingResult {
	/**
	 * Pass directly to React Hook Form's handleSubmit.
	 *
	 * Executes the 3-step onboarding sequence:
	 *  1. POST /profiles/me/onboarding  → persist profile data + set onboardingCompleted
	 *  2. GET  /auth/me                 → re-bootstrap authSlice
	 *  3. router.replace()              → navigate to dashboard
	 */
	submit: (
		data: EditProfileInput,
		callbacks?: OnboardingCallbacks
	) => Promise<void>;

	/**
	 * Call when the user clicks "Skip for now".
	 *
	 * Executes the same 3-step sequence as submit but with an empty body.
	 * This sets onboardingCompleted: true on the server without saving
	 * any profile fields — the user will never be redirected to /onboarding
	 * again, but the Getting Started checklist will appear on the dashboard
	 * to nudge them toward completing their profile at their own pace.
	 *
	 * This is the core of the Soft Nudge strategy:
	 * - The gate is opened immediately
	 * - The pressure to fill data is replaced by a gentle, dismissible checklist
	 */
	skip: (callbacks?: OnboardingCallbacks) => Promise<void>;

	/**
	 * True while either the POST or the /auth/me re-fetch is in-flight.
	 * Disable the submit button and show a loading indicator.
	 */
	isLoading: boolean;

	/**
	 * True specifically while the skip action is in-flight.
	 * Use to show a spinner on the skip button without disabling the whole form.
	 */
	isSkipping: boolean;

	/**
	 * Normalized HttpClientError — null when no error.
	 * Only reflects errors from the POST step.
	 * Skip errors are silent (treated as a successful skip).
	 */
	error: HttpClientError | null;

	/** Reset mutation error state */
	reset: () => void;
}

// ─── Internal helper ─────────────────────────────────────────────────────────

// ─── Hook ────────────────────────────────────────────────────────────────────

/**
 * useOnboarding
 *
 * Orchestrates the complete onboarding flow — both submit and skip paths.
 *
 * @remarks
 * Why both paths use the same 3-step sequence:
 *
 *  1. POST /profiles/me/onboarding
 *     → Sets onboardingCompleted: true on the server.
 *     → For submit: also saves profile field data.
 *     → For skip:  sends {} — only the flag is set.
 *
 *  2. GET /auth/me (forceRefetch)
 *     → Re-bootstraps authSlice so profile.onboardingCompleted becomes true.
 *     → Without this, OnboardingLayout would redirect back to /onboarding
 *       on the next render cycle because authSlice still has the old value.
 *     → Fire-and-forget: we don't await this before navigating.
 *
 *  3. router.replace('/dashboard')
 *     → Explicit navigation. Faster than waiting for the layout guard
 *       to react to authSlice update.
 *
 * Why skip errors are silent:
 *   If the skip POST fails, the user sees nothing — they're just not
 *   redirected. On next login, /auth/me will still return
 *   onboardingCompleted: false and they'll be sent to /onboarding again.
 *   This is acceptable: the skip was their choice, not a data operation.
 *   Showing an error on a skip action creates worse UX than silently retrying.
 *
 * @example
 * const { submit, skip, isLoading, isSkipping, error } = useOnboarding();
 *
 * // Wire submit to RHF
 * <form onSubmit={handleSubmit(submit)}>
 *
 * // Wire skip to a button
 * <button onClick={skip} disabled={isSkipping}>Skip for now</button>
 */
const useOnboarding = (options?: UseOnboardingOptions): UseOnboardingResult => {
	const router = useRouter();
	const dispatch = useAppDispatch();
	const redirectTo = options?.redirectTo ?? '/dashboard';

	const [completeOnboarding, { isLoading, error: rawError, reset }] =
		useCompleteOnboardingMutation();

	// ── Shared post-completion sequence ──────────────────────────────────────
	// Both submit and skip call this after their respective POST succeeds.
	const finalizeOnboarding = useCallback(() => {
		// Re-bootstrap authSlice — fire-and-forget, don't await
		dispatch(
			authApi.endpoints.me.initiate(undefined, { forceRefetch: true })
		);
		// Navigate immediately — don't wait for authSlice to update
		router.replace(redirectTo);
	}, [dispatch, router, redirectTo]);

	// ── Submit: saves profile data + completes onboarding ────────────────────
	const submit = useCallback(
		async (data: EditProfileInput, callback?: OnboardingCallbacks) => {
			// .unwrap() re-throws on failure — RHF handleSubmit catches it
			const { message } = await completeOnboarding(data).unwrap();

			finalizeOnboarding();

			callback?.onSuccess?.(message);
		},
		[completeOnboarding, finalizeOnboarding]
	);

	// ── Skip: sets the flag only, saves no profile data ──────────────────────
	const skip = useCallback(
		async (callback?: OnboardingCallbacks) => {
			try {
				// Empty body — service filters out undefined/null values,
				// only onboardingCompleted: true is written to the database.
				await completeOnboarding({} as EditProfileInput).unwrap();

				finalizeOnboarding();
			} catch (err: unknown) {
				// Silent failure for skip — see JSDoc above for rationale.
				// The user stays on /onboarding and can try submitting the form
				// or attempt to skip again.
				callback?.onError?.(err as HttpClientError);
				// notify.warning({
				//     message: "Couldn't skip right now",
				//     description: "You'll be prompted again on your next visit. Your data is safe.",
				//     duration: 5000,
				// });
			}
		},
		[completeOnboarding, finalizeOnboarding]
	);

	return {
		submit,
		skip,
		isLoading,
		// isSkipping mirrors isLoading but only when skip triggered it.
		// Since RTK Query's isLoading is shared across both calls on the
		// same mutation instance, we expose it as isSkipping too so the
		// UI can differentiate which button shows a spinner.
		// In practice: if the form is submitting, skip button is implicitly
		// disabled via isLoading; if skipping, the submit button shows nothing.
		isSkipping: isLoading,
		error: (rawError as HttpClientError | undefined) ?? null,
		reset,
	};
};

export default useOnboarding;
