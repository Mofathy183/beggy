// SignupForm.tsx
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AuthSchema } from '@beggy/shared/schemas';
import type { SignUpInput } from '@beggy/shared/types';
import { useSignup } from '@features/auth/hooks';
import SignupFormUI from './SignupFormUI';

const SignupForm = () => {
	const form = useForm<SignUpInput>({
		resolver: zodResolver(AuthSchema.signUp as any),
		defaultValues: {
			firstName: '',
			lastName: '',
			email: '',
			password: '',
			confirmPassword: '',
			avatarUrl: null,
			gender: undefined,
			birthDate: undefined,
			country: '',
			city: '',
		},
	});

	const { signup, isLoading, serverError } = useSignup();

	return (
		<SignupFormUI
			form={form}
			onSubmit={signup}
			isSubmitting={isLoading}
			serverError={serverError}
		/>
	);
};

export default SignupForm;
