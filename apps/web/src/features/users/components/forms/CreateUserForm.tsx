'use client';

import { type SubmitHandler, type Resolver, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';

import type { CreateUserInput } from '@beggy/shared/types';
import { AdminSchema } from '@beggy/shared/schemas';

import CreateUserFormUI from './CreateUserFormUI';
import { useUserMutations } from '@features/users/hooks';

import { notify } from '@shared/utils';
import type { HttpClientError } from '@shared/types';

type CreateUserFormProps = {
	onCancel?: () => void;
};

/**
 * CreateUserForm
 *
 * Container component responsible for:
 * - Orchestrating form state via React Hook Form
 * - Validating input using Zod schema (AdminSchema.createUser)
 * - Executing the createUser mutation
 * - Managing server-side error feedback
 *
 * This component separates domain logic from presentation.
 * The UI layer (CreateUserFormUI) remains purely presentational.
 *
 * Architectural role:
 * UI (CreateUserFormUI)
 * ← Container (CreateUserForm)
 * ← Infrastructure (useUserMutations)
 */
const CreateUserForm = ({ onCancel }: CreateUserFormProps) => {
	/**
	 * Infrastructure-level mutation hooks.
	 * Exposes grouped mutation states and action methods.
	 */
	const { createUser, states } = useUserMutations();

	/**
	 * Server error from the create mutation.
	 * Matches EditProfileForm's error?.body.message pattern.
	 */
	const error = states.create.error as HttpClientError | undefined;

	/**
	 * React Hook Form configuration.
	 *
	 * - Uses shared CreateUserInput contract for typing.
	 * - Zod resolver enforces AdminSchema.createUser validation rules.
	 * - Default values ensure controlled inputs and predictable UX.
	 * - mode: 'onSubmit' keeps validation calm until user submits.
	 */
	const form = useForm<CreateUserInput, unknown, CreateUserInput>({
		resolver: zodResolver(
			AdminSchema.createUser
		) as Resolver<CreateUserInput>,
		defaultValues: {
			firstName: '',
			lastName: '',
			email: '',
			password: '',
			confirmPassword: '',
		},
		mode: 'onSubmit',
	});

	// Clear the server error banner when the user edits any field
	useEffect(() => {
		if (!error) return;
		// eslint-disable-next-line react-hooks/incompatible-library
		const { unsubscribe } = form.watch(() => {
			states.create.reset();
		});

		return unsubscribe;
	}, [form, error, states.create]);

	/**
	 * Handles form submission.
	 *
	 * Responsibilities:
	 * - Clear previous server errors
	 * - Trigger createUser mutation
	 * - Reset form on success
	 * - Surface API errors to UI
	 */
	const onSubmit: SubmitHandler<CreateUserInput> = async (
		values: CreateUserInput
	) => {
		if (states.create.isLoading) return;

		try {
			// Execute mutation (unwrap throws on failure)
			const { message } = await createUser(values).unwrap();

			// Reset form to initial state after successful creation
			form.reset();
			notify.success({ message });
		} catch (error: unknown) {
			notify.error.fromHttp(error as HttpClientError);
		}
	};

	/**
	 * Delegates rendering to presentational component.
	 * Keeps this file focused purely on logic orchestration.
	 */
	return (
		<CreateUserFormUI
			form={form}
			onSubmit={onSubmit}
			isSubmitting={states.create.isLoading}
			serverError={error?.body.message ?? null}
			serverSuggestion={error?.body.suggestion ?? null}
			onCancel={onCancel}
		/>
	);
};

export default CreateUserForm;
