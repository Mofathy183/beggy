'use client';
import { useEffect } from 'react';
import { type SubmitHandler, type Resolver, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AuthSchema } from '@beggy/shared/schemas';
import type { SignUpInput } from '@beggy/shared/types';
import { useSignup } from '@features/auth/hooks';
import SignupFormUI from './SignupFormUI';
import type { HttpClientError } from '@shared/types';
import { notify } from '@shared/utils';

const SignupForm = () => {
	const form = useForm<SignUpInput, unknown, SignUpInput>({
		resolver: zodResolver(AuthSchema.signUp) as Resolver<SignUpInput>,
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
		// eslint-disable-next-line react-hooks/incompatible-library
		const { unsubscribe } = form.watch(() => {
			reset();
		});

		return unsubscribe;
	}, [form, error, isLoading, reset]);

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
