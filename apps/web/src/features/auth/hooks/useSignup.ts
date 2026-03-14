'use client';

import { useAppDispatch } from '@shared/store';
import { authApi, useSignupMutation } from '@features/auth/api';
import useAuthRedirect from './useAuthRedirect';
import type { SignUpInput } from '@beggy/shared/types';
import type { HttpClientError } from '@shared/types';

type AuthCallbacks = {
	onSuccess?: (message: string) => void;
	onError?: (error: unknown) => void;
};

/**
 * useSignup
 *
 * Owns the complete signup interaction lifecycle.
 *
 * Same error handling pattern as useLogin.
 *
 * Notable case: 409 CONFLICT means the email is already registered.
 * body.message will be the Beggy-style copy for that ErrorCode —
 * no special handling needed, it renders via root error automatically.
 */
const useSignup = () => {
	const dispatch = useAppDispatch();
	const [signupMutation, { isLoading, error: rawError, reset }] =
		useSignupMutation();

	useAuthRedirect();

	const signup = async (values: SignUpInput, callbacks?: AuthCallbacks) => {
		if (isLoading) return;

		try {
			const { message } = await signupMutation(values).unwrap();
			//* This goes through onQueryStarted → dispatches setAuthenticated
			// authSlice.profile and authSlice.status update → useAuthRedirect fires
			await dispatch(
				authApi.endpoints.me.initiate(undefined, { forceRefetch: true })
			);

			callbacks?.onSuccess?.(message);
		} catch (err: unknown) {
			callbacks?.onError?.(err as HttpClientError);
		}
	};

	return {
		signup,
		reset,
		isLoading,
		// baseQuery sets the error as HttpClientError (the BaseQueryFn generic).
		// RTK Query types rawError as HttpClientError | undefined here.
		error: (rawError as HttpClientError | undefined) ?? null,
	};
};

export default useSignup;
