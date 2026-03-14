'use client';

import type { ChangeRoleInput } from '@beggy/shared/types';
import { SubmitHandler, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useUserMutations } from '@features/users/hooks';
import ChangeRoleFormUI from './ChangeRoleFormUI';
import { AdminSchema } from '@beggy/shared/schemas';

import { notify } from '@shared/utils';
import type { HttpClientError } from '@shared/types';

type Props = {
	/**
	 * Unique identifier of the user whose role will be updated.
	 */
	userId: string;

	/**
	 * The user's current role.
	 * Used to initialize the select field for better UX clarity.
	 */
	currentRole?: ChangeRoleInput['role'];

	onCancel?: () => void;
};

/**
 * ChangeRoleForm
 *
 * Container component responsible for:
 * - Managing form state via React Hook Form
 * - Validating input using AdminSchema.changeRole
 * - Executing the changeRole mutation
 * - Handling server-side errors
 *
 * This component intentionally separates:
 * - Business logic (this file)
 * - Presentation layer (ChangeRoleFormUI)
 *
 * This ensures the UI remains reusable and testable,
 * while domain logic stays centralized and predictable.
 */
const ChangeRoleForm = ({ userId, currentRole, onCancel }: Props) => {
	/**
	 * Infrastructure-level user mutations.
	 * changeRole performs the API call.
	 * states.changeRole exposes loading & status flags.
	 */
	const { changeRole, states } = useUserMutations();

	/**
	 * Server error from the create mutation.
	 * Matches EditProfileForm's error?.body.message pattern.
	 */
	const error = states.create.error as HttpClientError | undefined;

	/**
	 * React Hook Form setup.
	 *
	 * - Uses shared ChangeRoleInput contract for strong typing.
	 * - Zod resolver ensures enum-safe validation.
	 * - Default role improves clarity and prevents empty select state.
	 * - mode: 'onSubmit' avoids aggressive validation UX.
	 */
	const form = useForm<ChangeRoleInput>({
		resolver: zodResolver(AdminSchema.changeRole as any),
		defaultValues: {
			role: currentRole,
		},
		mode: 'onSubmit',
	});

	// Clear the server error banner when the user edits any field
	useEffect(() => {
		if (!error) return;
		const subscription = form.watch(() => {
			// Reset mutation state to clear the error banner
			states.changeRole.reset?.();
		});
		return () => subscription.unsubscribe();
	}, [form, error, states.changeRole]);

	/**
	 * Handles form submission lifecycle.
	 *
	 * Flow:
	 * 1. Clear previous server errors
	 * 2. Trigger mutation
	 * 3. Reset form to reflect updated state
	 * 4. Surface API error if mutation fails
	 */
	const onSubmit: SubmitHandler<ChangeRoleInput> = async (
		values: ChangeRoleInput
	) => {
		if (states.changeRole.isLoading) return;

		try {
			// Execute role change mutation
			const { message } = await changeRole(userId, values).unwrap();

			// Reset form while preserving selected role
			form.reset(values);

			notify.success({ message });
		} catch (error: any) {
			notify.error.fromHttp(error as HttpClientError);
		}
	};

	/**
	 * Delegates rendering to presentation component.
	 * Keeps this container focused purely on orchestration logic.
	 */
	return (
		<ChangeRoleFormUI
			form={form}
			onSubmit={form.handleSubmit(onSubmit)}
			isSubmitting={states.changeRole.isLoading}
			serverError={error?.body.message ?? null}
			serverSuggestion={error?.body.suggestion ?? null}
			onCancel={onCancel}
		/>
	);
};

export default ChangeRoleForm;
