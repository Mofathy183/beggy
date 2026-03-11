'use client';

import { useState } from 'react';
import { useAppDispatch } from '@shared/store';
import { authApi, useLoginMutation } from '@features/auth/api';
import useAuthRedirect from './useAuthRedirect';
import type { LoginInput } from '@beggy/shared/types';
import type { HttpClientError } from '@shared/types';

/**
 * useLogin
 *
 * Owns the complete login interaction lifecycle.
 *
 * Responsibilities:
 * - Fires the login mutation
 * - Maps HttpClientError to a root form error
 * - Delegates redirect to useAuthRedirect
 *
 * Error handling:
 * - baseQuery normalizes all errors to HttpClientError before they arrive here
 * - unwrap() throws HttpClientError directly — no re-normalization needed
 * - ErrorResponse has no errors[] array — all errors are root-level
 * - body.message is already Beggy-style copy from ErrorMessages
 * - body.suggestion is available for secondary UX copy if needed
 *
 * Client-side validation:
 * - react-hook-form + loginSchema blocks submission before this runs
 * - Server errors here are cases the schema cannot catch:
 *   wrong credentials, inactive account, rate limiting, etc.
 */
const useLogin = () => {
	const dispatch = useAppDispatch();
	const [loginMutation, { isLoading }] = useLoginMutation();
	const [serverError, setServerError] = useState<string | null>(null);

	useAuthRedirect();

	const login = async (values: LoginInput) => {
		if (isLoading) return;

		setServerError(null);

		try {
			await loginMutation(values).unwrap();
			// ✅ This goes through onQueryStarted → dispatches setAuthenticated
			// authSlice.profile and authSlice.status update → useAuthRedirect fires
			await dispatch(
				authApi.endpoints.me.initiate(undefined, { forceRefetch: true })
			);
		} catch (err) {
			const error = err as HttpClientError;
			setServerError(error.body?.message ?? 'Something went wrong.');
		}
	};

	return {
		login,
		isLoading,
		serverError,
	};
};

export default useLogin;
