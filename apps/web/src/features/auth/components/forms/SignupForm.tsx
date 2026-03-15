'use client';
import { useEffect } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AuthSchema } from '@beggy/shared/schemas';
import type { SignUpInput } from '@beggy/shared/types';
import { useSignup } from '@features/auth/hooks';
import SignupFormUI from './SignupFormUI';
import type { HttpClientError } from '@shared/types';
import { notify } from '@shared/utils';

const SignupForm = () => {
	const form = useForm<SignUpInput>({
		resolver: zodResolver(AuthSchema.signUp as any),
		defaultValues: {
			firstName: '',
			lastName: '',
			email: '',
			password: '',
			confirmPassword: '',
		},
	});

	const { signup, reset, isLoading, error } = useSignup();

	// Clear the server error banner when the user edits any field
	useEffect(() => {
		if (!error) return;
		const subscription = form.watch(() => {
			// Reset mutation state to clear the error banner
			reset;
		});
		return () => subscription.unsubscribe();
	}, [form, error, isLoading]);

	const onSubmit: SubmitHandler<SignUpInput> = async (values) => {
		if (isLoading) return;
		await signup(values, {
			onSuccess: (message) => {
				notify.success({ message });
			},
			onError: (error) => {
				notify.error.fromHttp(error as HttpClientError);
			},
		});
	};

	return (
		<SignupFormUI
			form={form}
			onSubmit={onSubmit}
			isSubmitting={isLoading}
			serverError={error?.body.message ?? null}
			serverSuggestion={error?.body.suggestion ?? null}
		/>
	);
};

export default SignupForm;
