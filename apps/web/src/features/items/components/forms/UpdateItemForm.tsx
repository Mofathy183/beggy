'use client';

import { useEffect } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { ItemSchema } from '@beggy/shared/schemas';
import type { ItemDTO, UpdateItemInput } from '@beggy/shared/types';

import { useItemsActions } from '@features/items/hooks';
import UpdateItemFormUI from './UpdateItemFormUI';

// ─── Types ─────────────────────────────────────────────────────────────────────

type UpdateItemFormProps = {
	/**
	 * The item to edit. Used to pre-fill the form.
	 * Pass the ItemDTO from useItemDetails() or the items list directly.
	 */
	item: ItemDTO;
	/** Called after a successful update. */
	onSuccess?: () => void;
	/** Called when the user cancels — closes the dialog. */
	onCancel?: () => void;
};

// ─── Component ─────────────────────────────────────────────────────────────────

/**
 * UpdateItemForm
 *
 * Container responsible for:
 * - Form state via React Hook Form + ItemSchema.update (all optional — PATCH)
 * - PATCH /items/:id via useItemActions.edit
 * - Pre-populating all fields from the provided ItemDTO
 * - Clearing the server error banner when the user starts typing again
 *
 * Architectural role:
 *   UpdateItemFormUI  ← presentation only
 *   UpdateItemForm    ← logic orchestration  ← you are here
 *   useItemActions    ← mutation + error
 */
const UpdateItemForm = ({ item, onSuccess, onCancel }: UpdateItemFormProps) => {
	const { edit, isUpdating, states } = useItemsActions();

	/**
	 * Server error from the update mutation.
	 * Matches EditProfileForm's error?.body.message pattern.
	 */
	const error = states.update.error as
		| { body: { message: string; suggestion?: string } }
		| undefined;

	const form = useForm<UpdateItemInput>({
		resolver: zodResolver(ItemSchema.update as any),
		/**
		 * Pre-populate from the ItemDTO.
		 * null fields are coerced to undefined — correct for PATCH semantics.
		 * Only changed fields are sent by the container's onSubmit.
		 */
		defaultValues: {
			name: item.name,
			category: item.category,
			weight: item.weight,
			weightUnit: item.weightUnit,
			volume: item.volume,
			volumeUnit: item.volumeUnit,
			color: item.color ?? undefined,
			isFragile: item.isFragile,
		},
		// onTouched: validate on blur — faster feedback without keystroke jitter
		mode: 'onTouched',
	});

	/**
	 * Re-populate form when the item prop changes.
	 * Handles the case where the parent passes a refreshed ItemDTO after
	 * the list re-fetches (e.g. optimistic update resolves).
	 */
	useEffect(() => {
		form.reset({
			name: item.name,
			category: item.category,
			weight: item.weight,
			weightUnit: item.weightUnit,
			volume: item.volume,
			volumeUnit: item.volumeUnit,
			color: item.color ?? undefined,
			isFragile: item.isFragile,
		});
	}, [item, form]);

	// Clear server error banner when user edits any field
	useEffect(() => {
		if (!error) return;
		const subscription = form.watch(() => {
			states.update.reset?.();
		});
		return () => subscription.unsubscribe();
	}, [form, error, states.update]);

	const onSubmit: SubmitHandler<UpdateItemInput> = async (values) => {
		if (isUpdating) return;
		await edit(item.id, values, { onSuccess });
	};

	return (
		<UpdateItemFormUI
			form={form}
			onSubmit={onSubmit}
			onCancel={onCancel}
			isSubmitting={isUpdating}
			serverError={error?.body.message ?? null}
			serverSuggestion={error?.body.suggestion ?? null}
		/>
	);
};

export default UpdateItemForm;
