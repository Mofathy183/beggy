'use client';

import { useEffect } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { BagSchema } from '@beggy/shared/schemas';
import type { BagDTO, UpdateBagInput } from '@beggy/shared/types';

import { useBagActions } from '@features/bags/hooks';
import UpdateBagFormUI from './UpdateBagFormUI';
import { notify } from '@shared/utils';
import type { HttpClientError } from '@shared/types';

// ─── Types ────────────────────────────────────────────────────────────────────

type UpdateBagFormProps = {
	/** The bag to edit — used to pre-fill the form. */
	bag: BagDTO;
	/** Called after a successful update. */
	onSuccess?: () => void;
	/** Called when the user cancels — closes the dialog. */
	onCancel?: () => void;
};

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * UpdateBagForm
 *
 * Container responsible for:
 * - Form state via React Hook Form + BagSchema.update (all optional — PATCH)
 * - PATCH /bags/:id via useBagActions.edit
 * - Pre-populating all fields from the provided BagDTO
 * - Clearing server error banner when user edits any field
 *
 * Architectural role:
 *   UpdateBagFormUI  ← presentation only
 *   UpdateBagForm    ← logic orchestration  ← you are here
 *   useBagActions    ← mutation + error
 */
const UpdateBagForm = ({ bag, onSuccess, onCancel }: UpdateBagFormProps) => {
	const { edit, isUpdating, states } = useBagActions();

	const error = states.update.error as HttpClientError | undefined;

	const form = useForm<UpdateBagInput>({
		resolver: zodResolver(BagSchema.update as any),
		defaultValues: {
			name: bag.name,
			type: bag.type,
			color: bag.color ?? undefined,
			size: bag.size,
			maxWeight: bag.maxWeight,
			maxCapacity: bag.maxCapacity,
			emptyWeight: bag.emptyWeight ?? 0,
			material: bag.material ?? undefined,
			features: bag.features ?? [],
		},
		mode: 'onTouched',
	});

	// Re-populate when bag prop changes (e.g. after refetch resolves)
	useEffect(() => {
		form.reset({
			name: bag.name,
			type: bag.type,
			color: bag.color ?? undefined,
			size: bag.size,
			maxWeight: bag.maxWeight,
			maxCapacity: bag.maxCapacity,
			emptyWeight: bag.emptyWeight ?? 0,
			material: bag.material ?? undefined,
			features: bag.features ?? [],
		});
	}, [bag, form]);

	// Clear server error banner when user edits any field
	useEffect(() => {
		if (!error) return;
		const subscription = form.watch(() => {
			states.update.reset?.();
		});
		return () => subscription.unsubscribe();
	}, [form, error, states.update]);

	const onSubmit: SubmitHandler<UpdateBagInput> = async (values) => {
		if (isUpdating) return;
		await edit(bag.id, values, {
			onSuccess: (message) => {
				notify.success({ message });
				onCancel?.();
				onSuccess?.();
			},
			onError: (err) => {
				notify.error.fromHttp(err as HttpClientError);
			},
		});
	};

	return (
		<UpdateBagFormUI
			form={form}
			onSubmit={onSubmit}
			onCancel={onCancel}
			isSubmitting={isUpdating}
			serverError={error?.body.message ?? null}
			serverSuggestion={error?.body.suggestion ?? null}
		/>
	);
};

export default UpdateBagForm;
