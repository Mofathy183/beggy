'use client';

import { useEffect } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import type { EditProfileInput } from '@beggy/shared/types';
import { ProfileSchema } from '@beggy/shared/schemas';

import OnboardingFormUI from './OnboardingFormUI';
import { useOnboarding } from '@features/profiles/hooks';

// ─── Props ────────────────────────────────────────────────────────────────────

type OnboardingFormProps = {
	/** Override the post-onboarding redirect. Defaults to '/dashboard'. */
	redirectTo?: string;
};

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * OnboardingForm
 *
 * Container responsible for:
 * - Form state via React Hook Form + ProfileSchema.editProfile
 * - Running the 3-step onboarding sequence via useOnboarding:
 *     1. PATCH /profiles/me
 *     2. GET  /auth/me  (re-bootstraps authSlice so the guard clears)
 *     3. router.replace('/dashboard')
 * - Clearing the server error banner when the user starts typing again
 *
 * Architectural role:
 *   OnboardingFormUI  ← presentation only
 *   OnboardingForm    ← logic orchestration  ← you are here
 *   useOnboarding     ← 3-step sequence + HttpClientError
 */
const OnboardingForm = ({ redirectTo }: OnboardingFormProps) => {
	const {
		submit,
		isLoading,
		error,
		reset: resetMutation,
	} = useOnboarding({ redirectTo });

	const form = useForm<EditProfileInput>({
		resolver: zodResolver(ProfileSchema.editProfile as any),
		defaultValues: {
			firstName: undefined,
			lastName: undefined,
			avatarUrl: undefined,
			gender: undefined,
			birthDate: undefined,
			country: undefined,
			city: undefined,
		},
		// onTouched: same pattern as EditProfileForm — validate on blur
		mode: 'onTouched',
	});

	// Clear the server error banner when the user edits any field
	useEffect(() => {
		if (!error) return;
		const subscription = form.watch(() => resetMutation());
		return () => subscription.unsubscribe();
	}, [form, error, resetMutation]);

	const onSubmit: SubmitHandler<EditProfileInput> = async (values) => {
		if (isLoading) return;
		await submit(values);
	};

	return (
		<OnboardingFormUI
			form={form}
			onSubmit={onSubmit}
			isSubmitting={isLoading}
			serverError={error?.body.message ?? null}
			serverSuggestion={error?.body.suggestion ?? null}
		/>
	);
};

export default OnboardingForm;
