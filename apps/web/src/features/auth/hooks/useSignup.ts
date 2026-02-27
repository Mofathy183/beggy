'use client';

import { useState } from 'react';
import { useSignupMutation } from '@features/auth/api';
import useAuthRedirect from './useAuthRedirect';
import type { SignUpInput } from '@beggy/shared/types';
import type { HttpClientError } from '@shared/types';

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
	const [signupMutation, { isLoading }] = useSignupMutation();
	const [serverError, setServerError] = useState<string | null>(null);

	useAuthRedirect();

	const signup = async (values: SignUpInput) => {
		if (isLoading) return;

		setServerError(null);

		try {
			await signupMutation(values).unwrap();
		} catch (err) {
			const error = err as HttpClientError;

			setServerError(error.body?.message ?? 'Something went wrong.');
		}
	};

	return {
		signup,
		isLoading,
		serverError,
	};
};

export default useSignup;
