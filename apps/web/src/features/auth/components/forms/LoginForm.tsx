'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AuthSchema } from '@beggy/shared/schemas';
import type { LoginInput } from '@beggy/shared/types';
import { useLogin } from '@features/auth/hooks';
import LoginFormUI from './LoginFormUI';

const LoginForm = () => {
	const form = useForm<LoginInput>({
		resolver: zodResolver(AuthSchema.login as any),
		defaultValues: {
			email: '',
			password: '',
			rememberMe: false,
		},
	});

	const { login, isLoading, serverError } = useLogin();

	return (
		<LoginFormUI
			form={form}
			onSubmit={login}
			isSubmitting={isLoading}
			serverError={serverError}
		/>
	);
};

export default LoginForm;
