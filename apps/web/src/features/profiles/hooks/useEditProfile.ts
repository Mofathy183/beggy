'use client';

import { useCallback } from 'react';
import { useEditProfileMutation } from '@features/profiles/api';
import type { EditProfileInput, ProfileDTO } from '@beggy/shared/types';
import type { HttpClientError } from '@shared/types';

// ─── Types ────────────────────────────────────────────────────────────────────

/**
 * Options accepted by useEditProfile.
 */
export interface UseEditProfileOptions {
	/**
	 * Called after a successful PATCH /profiles/me.
	 *
	 * Use this to:
	 * - Show a success toast
	 * - Call syncProfile() if authSlice.profile is displayed in the AppShell
	 * - Close a dialog
	 *
	 * @param updatedProfile - The updated ProfileDTO returned by the server
	 */
	onSuccess?: (updatedProfile: ProfileDTO) => void;
}

/**
 * Return shape of useEditProfile.
 */
export interface UseEditProfileResult {
	/**
	 * Pass directly to React Hook Form's handleSubmit.
	 *
	 * @example
	 * <form onSubmit={handleSubmit(submit)}>
	 *
	 * Internally calls .unwrap() so RHF's handleSubmit can catch
	 * thrown errors and set form-level errors via setError('root', ...).
	 */
	submit: (data: EditProfileInput) => Promise<void>;
	isLoading: boolean;
	/**
	 * Normalized HttpClientError from baseQuery — null when no error.
	 *
	 * Components can read:
	 *   error?.body.message     — user-facing message
	 *   error?.body.suggestion  — user-facing suggestion
	 *   error?.statusCode       — HTTP status (e.g. 409 for conflict)
	 *
	 * No further normalization needed — baseQuery already handled it.
	 */
	error: HttpClientError | null;
	/** Reset mutation state (clears error + isLoading) without refetching */
	reset: () => void;
}

// ─── Hook ────────────────────────────────────────────────────────────────────

/**
 * useEditProfile
 *
 * Wraps `useEditProfileMutation` for use in settings profile edit forms.
 *
 * @remarks
 * Intentionally does NOT re-fetch /auth/me after a successful edit.
 * Settings edits only need to invalidate the Profile RTK Query cache
 * (done automatically by `editProfile` via `invalidatesTags: ['Profile']`).
 *
 * If your AppShell reads displayName or avatarUrl from authSlice
 * (common for sidebar/header), call `useProfileSyncWithAuth().syncProfile()`
 * in the onSuccess callback to push the new values into authSlice too.
 *
 * @example
 * // Basic
 * const { submit, isLoading, error } = useEditProfile();
 *
 * // With success callback
 * const { syncProfile } = useProfileSyncWithAuth();
 * const { submit, isLoading, error } = useEditProfile({
 *   onSuccess: (updated) => {
 *     syncProfile();
 *     toast({ title: `Profile updated, ${updated.firstName}!` });
 *   },
 * });
 *
 * // Wire to RHF
 * <form onSubmit={handleSubmit(submit)}>
 */
const useEditProfile = (
	options?: UseEditProfileOptions
): UseEditProfileResult => {
	const [editProfile, { isLoading, error: rawError, reset }] =
		useEditProfileMutation();

	const submit = useCallback(
		async (data: EditProfileInput) => {
			// .unwrap() re-throws the HttpClientError on failure.
			// React Hook Form's handleSubmit catches it — components can then
			// call setError('root', { message: err.body.message }) if needed.
			const response = await editProfile(data).unwrap();
			options?.onSuccess?.(response.data);
		},
		[editProfile, options]
	);

	return {
		submit,
		isLoading,
		// baseQuery sets the error as HttpClientError (the BaseQueryFn generic).
		// RTK Query types rawError as HttpClientError | undefined here.
		error: (rawError as HttpClientError | undefined) ?? null,
		reset,
	};
};

export default useEditProfile;
