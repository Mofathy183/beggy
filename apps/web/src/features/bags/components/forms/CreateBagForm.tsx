'use client';

import { useEffect } from 'react';
import { type SubmitHandler, type Resolver, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { BagSchema } from '@beggy/shared/schemas';
import type { CreateBagInput } from '@beggy/shared/types';

import { useBagActions } from '@features/bags/hooks';
import CreateBagFormUI from './CreateBagFormUI';
import { notify } from '@shared/utils';
import type { HttpClientError } from '@shared/types';

// ─── Types ────────────────────────────────────────────────────────────────────

type CreateBagFormProps = {
	/** Called after a successful create. */
	onSuccess?: () => void;
	/** Called when the user cancels — closes the dialog. */
	onCancel?: () => void;
};

// ─── Default values ───────────────────────────────────────────────────────────

/**
 * Sensible defaults matching BagSchema.create defaults.
 *
 * - color: 'black' — matches schema default
 * - emptyWeight: 0 — matches schema default
 * - features: [] — no features selected
 */
const DEFAULT_VALUES: Partial<CreateBagInput> = {
	name: '',
	type: undefined,
	size: undefined,
	maxWeight: undefined,
	maxCapacity: undefined,
	color: 'black',
	emptyWeight: 0,
	features: [],
};

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * CreateBagForm
 *
 * Container responsible for:
 * - Form state via React Hook Form + BagSchema.create
 * - POST /bags via useBagActions.create
 * - Clearing server error banner when user edits any field
 *
 * Architectural role:
 *   CreateBagFormUI  ← presentation only
 *   CreateBagForm    ← logic orchestration  ← you are here
 *   useBagActions    ← mutation + error
 */
const CreateBagForm = ({ onSuccess, onCancel }: CreateBagFormProps) => {
	const { create, isCreating, states } = useBagActions();

	const error = states.create.error as HttpClientError | undefined;

	const form = useForm<CreateBagInput, unknown, CreateBagInput>({
		resolver: zodResolver(BagSchema.create) as Resolver<CreateBagInput>,
		defaultValues: DEFAULT_VALUES,
		mode: 'onSubmit',
	});

	// Clear server error banner when user edits any field
	useEffect(() => {
		if (!error) return;
		// eslint-disable-next-line react-hooks/incompatible-library
		const { unsubscribe } = form.watch(() => {
			states.create.reset();
		});

		return unsubscribe;
	}, [error, states.create, form]);

	const onSubmit: SubmitHandler<CreateBagInput> = async (values) => {
		if (isCreating) return;
		await create(values, {
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
		<CreateBagFormUI
			form={form}
			onSubmit={onSubmit}
			onCancel={onCancel}
			isSubmitting={isCreating}
			serverError={error?.body.message ?? null}
			serverSuggestion={error?.body.suggestion ?? null}
		/>
	);
};

export default CreateBagForm;
