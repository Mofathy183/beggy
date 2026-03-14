'use client';
import { useEffect } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AuthSchema } from '@beggy/shared/schemas';
import type { LoginInput } from '@beggy/shared/types';
import { useLogin } from '@features/auth/hooks';
import LoginFormUI from './LoginFormUI';
import type { HttpClientError } from '@shared/types';
import { notify } from '@shared/utils';

const LoginForm = () => {
	const form = useForm<LoginInput>({
		resolver: zodResolver(AuthSchema.login as any),
		defaultValues: {
			email: '',
			password: '',
			rememberMe: false,
		},
	});

	const { login, reset, isLoading, error } = useLogin();

	// Clear the server error banner when the user edits any field
	useEffect(() => {
		if (!error) return;
		const subscription = form.watch(() => {
			// Reset mutation state to clear the error banner
			reset;
		});
		return () => subscription.unsubscribe();
	}, [form, error, isLoading]);

	const onSubmit: SubmitHandler<LoginInput> = async (values) => {
		if (isLoading) return;
		await login(values, {
			onSuccess: (message) => {
				notify.success({ message });
			},
			onError: (error) => {
				notify.error.fromHttp(error as HttpClientError);
			},
		});
	};

	return (
		<LoginFormUI
			form={form}
			onSubmit={onSubmit}
			isSubmitting={isLoading}
			serverError={error?.body.message ?? null}
			serverSuggestion={error?.body.suggestion ?? null}
		/>
	);
};

export default LoginForm;
