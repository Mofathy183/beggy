'use client';

import { SubmitHandler, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';

import type { CreateUserInput } from '@beggy/shared/types';
import { AdminSchema } from '@beggy/shared/schemas';

import CreateUserFormUI from './CreateUserFormUI';
import { useUserMutations } from '@features/users/hooks';

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
	 * Holds server-side errors (e.g., API validation failures).
	 * These are separate from client-side schema validation errors.
	 */
	const [serverError, setServerError] = useState<string | null>(null);

	/**
	 * React Hook Form configuration.
	 *
	 * - Uses shared CreateUserInput contract for typing.
	 * - Zod resolver enforces AdminSchema.createUser validation rules.
	 * - Default values ensure controlled inputs and predictable UX.
	 * - mode: 'onSubmit' keeps validation calm until user submits.
	 */
	const form = useForm<CreateUserInput>({
		resolver: zodResolver(AdminSchema.createUser as any),
		defaultValues: {
			firstName: '',
			lastName: '',
			email: '',
			password: '',
			confirmPassword: '',
		},
		mode: 'onSubmit',
	});

	useEffect(() => {
		const subscription = form.watch(() => {
			if (serverError) setServerError(null);
		});
		return () => subscription.unsubscribe();
	}, [form, serverError]);

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
			// Clear any previous server error before new attempt
			setServerError(null);

			// Execute mutation (unwrap throws on failure)
			await createUser(values).unwrap();

			// Reset form to initial state after successful creation
			form.reset();
		} catch (error: any) {
			// Extract meaningful API error message if available
			setServerError(error?.data?.message || 'Failed to create user.');
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
			serverError={serverError}
			onCancel={onCancel}
		/>
	);
};

export default CreateUserForm;
