'use client';

import { useEffect } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { ItemSchema } from '@beggy/shared/schemas';
import type { CreateItemInput } from '@beggy/shared/types';
import { WeightUnit, VolumeUnit } from '@beggy/shared/constants';

import { useItemsActions } from '@features/items/hooks';
import CreateItemFormUI from './CreateItemFormUI';

// ─── Types ─────────────────────────────────────────────────────────────────────

type CreateItemFormProps = {
	/** Called after a successful create. Receives the created item's id. */
	onSuccess?: () => void;
	/** Called when the user cancels the form. */
	onCancel?: () => void;
};

// ─── Default values ─────────────────────────────────────────────────────────────

/**
 * Sensible defaults for the create form.
 *
 * - weightUnit: KILOGRAM — most common in travel context
 * - volumeUnit: LITER — most common for bags/luggage
 * - color: 'black' — matches ItemSchema.create default
 * - isFragile: false — matches ItemSchema.create default
 */
const DEFAULT_VALUES: Partial<CreateItemInput> = {
	weightUnit: WeightUnit.KILOGRAM,
	volumeUnit: VolumeUnit.LITER,
	color: 'black',
	isFragile: false,
};

// ─── Component ─────────────────────────────────────────────────────────────────

/**
 * CreateItemForm
 *
 * Container responsible for:
 * - Form state via React Hook Form + ItemSchema.create
 * - POST /items via useItemActions.create
 * - Clearing the server error banner when the user starts typing again
 *
 * Architectural role:
 *   CreateItemFormUI  ← presentation only
 *   CreateItemForm    ← logic orchestration  ← you are here
 *   useItemActions    ← mutation + error
 */
const CreateItemForm = ({ onSuccess, onCancel }: CreateItemFormProps) => {
	const { create, isCreating, states } = useItemsActions();

	/**
	 * Server error from the create mutation.
	 * Matches EditProfileForm's error?.body.message pattern.
	 */
	const error = states.create.error as
		| { body: { message: string; suggestion?: string } }
		| undefined;

	const form = useForm<CreateItemInput>({
		resolver: zodResolver(ItemSchema.create as any),
		defaultValues: DEFAULT_VALUES,
		// onTouched: validate on blur — faster feedback without keystroke jitter
		mode: 'onTouched',
	});

	// Clear the server error banner when the user edits any field
	useEffect(() => {
		if (!error) return;
		const subscription = form.watch(() => {
			// Reset mutation state to clear the error banner
			states.create.reset?.();
		});
		return () => subscription.unsubscribe();
	}, [form, error, states.create]);

	const onSubmit: SubmitHandler<CreateItemInput> = async (values) => {
		if (isCreating) return;
		await create(values, { onSuccess });
	};

	return (
		<CreateItemFormUI
			form={form}
			onSubmit={onSubmit}
			onCancel={onCancel}
			isSubmitting={isCreating}
			serverError={error?.body.message ?? null}
			serverSuggestion={error?.body.suggestion ?? null}
		/>
	);
};

export default CreateItemForm;
