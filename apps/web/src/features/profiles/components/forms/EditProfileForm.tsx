'use client';

import { useEffect } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import type { EditProfileInput } from '@beggy/shared/types';
import { ProfileSchema } from '@beggy/shared/schemas';

import EditProfileFormUI from './EditProfileFormUI';
import {
	useEditProfile,
	useProfileSyncWithAuth,
	type UseEditProfileOptions,
} from '@features/profiles/hooks';

type EditProfileFormProps = {
	/**
	 * Current profile values used to pre-fill the form.
	 * Pass the ProfileDTO from usePrivateProfile() directly.
	 * null fields are coerced to undefined — correct for PATCH semantics.
	 */
	defaultValues: Partial<EditProfileInput>;
	/** Called after a successful save. syncProfile() fires internally first. */
	onSuccess?: UseEditProfileOptions['onSuccess'];
};

/**
 * EditProfileForm
 *
 * Container responsible for:
 * - Form state via React Hook Form + ProfileSchema.editProfile (all optional)
 * - PATCH /profiles/me via useEditProfile
 * - Syncing authSlice after success via useProfileSyncWithAuth
 * - Clearing the server error banner when the user starts typing again
 *
 * Architectural role:
 *   EditProfileFormUI  ← presentation only
 *   EditProfileForm    ← logic orchestration  ← you are here
 *   useEditProfile     ← mutation + HttpClientError
 */
const EditProfileForm = ({
	defaultValues,
	onSuccess,
}: EditProfileFormProps) => {
	const { syncProfile } = useProfileSyncWithAuth();

	const {
		submit,
		isLoading,
		error,
		reset: resetMutation,
	} = useEditProfile({
		onSuccess: (updated) => {
			// Push updated displayName/avatarUrl into authSlice so the
			// AppShell sidebar/header reflects the change immediately.
			syncProfile();
			onSuccess?.(updated);
		},
	});

	const form = useForm<EditProfileInput>({
		resolver: zodResolver(ProfileSchema.editProfile as any),
		defaultValues: {
			firstName: defaultValues.firstName ?? undefined,
			lastName: defaultValues.lastName ?? undefined,
			avatarUrl: defaultValues.avatarUrl ?? undefined,
			gender: defaultValues.gender ?? undefined,
			birthDate: defaultValues.birthDate ?? undefined,
			country: defaultValues.country ?? undefined,
			city: defaultValues.city ?? undefined,
		},
		// onTouched: validate when the user leaves a field — faster feedback
		// without the keystroke jitter of onChange.
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
		<EditProfileFormUI
			form={form}
			onSubmit={onSubmit}
			isSubmitting={isLoading}
			serverError={error?.body.message ?? null}
			serverSuggestion={error?.body.suggestion ?? null}
		/>
	);
};

export default EditProfileForm;
