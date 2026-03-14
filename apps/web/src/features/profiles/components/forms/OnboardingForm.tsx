'use client';

import { useEffect } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import type { CompleteOnboardingInput } from '@beggy/shared/types';
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
 *     1. POST /profiles/me/onboarding
 *     2. GET  /auth/me  (re-bootstraps authSlice so the guard clears)
 *     3. router.replace('/dashboard')
 * - Wiring the skip action to OnboardingFormUI
 * - Clearing the server error banner when the user starts typing again
 *
 * Soft Nudge contract:
 *   submit → saves data + sets onboardingCompleted → /dashboard
 *   skip   → sets onboardingCompleted only (empty body) → /dashboard
 *   In both cases the user reaches the dashboard immediately.
 *   The Getting Started checklist on the dashboard handles the rest.
 *
 * Architecture:
 *   OnboardingFormUI  ← presentation only
 *   OnboardingForm    ← logic orchestration  ← you are here
 *   useOnboarding     ← 3-step sequence + skip + HttpClientError
 */
const OnboardingForm = ({ redirectTo }: OnboardingFormProps) => {
	const {
		submit,
		skip,
		isLoading,
		isSkipping,
		error,
		reset: resetMutation,
	} = useOnboarding({ redirectTo });

	const form = useForm<CompleteOnboardingInput>({
		resolver: zodResolver(ProfileSchema.completeOnboarding as any),
		defaultValues: {
			firstName: undefined,
			lastName: undefined,
			avatarUrl: undefined,
			gender: undefined,
			birthDate: undefined,
			country: undefined,
			city: undefined,
		},
		mode: 'onTouched',
	});

	// Clear the server error banner when the user edits any field
	useEffect(() => {
		if (!error) return;
		const subscription = form.watch(() => resetMutation());
		return () => subscription.unsubscribe();
	}, [form, error, resetMutation]);

	const onSubmit: SubmitHandler<CompleteOnboardingInput> = async (values) => {
		if (isLoading) return;
		await submit(values);
	};

	return (
		<OnboardingFormUI
			form={form}
			onSubmit={onSubmit}
			onSkip={skip}
			isSubmitting={isLoading}
			isSkipping={isSkipping}
			serverError={error?.body.message ?? null}
			serverSuggestion={error?.body.suggestion ?? null}
		/>
	);
};

export default OnboardingForm;
