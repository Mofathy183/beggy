'use client';

import { useEffect } from 'react';
import { type SubmitHandler, type Resolver, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { ContainerSchema } from '@beggy/shared/schemas';
import type { PackItemInput } from '@beggy/shared/types';

import { useContainerActions } from '@/features/containers/hooks';
import { useItemsList } from '@features/items/hooks';
import PackItemFormUI from './PackItemFormUI';
import { notify } from '@shared/utils';
import type { HttpClientError } from '@shared/types';

// ─── Types ─────────────────────────────────────────────────────────────────────

/**
 * Props for {@link PackItemForm}.
 *
 * @description
 * Defines the external contract for packing an item into a container.
 * This component handles orchestration, while UI is delegated downstream.
 */
type PackItemFormProps = {
	/** Target container identifier. */
	containerId: string;

	/**
	 * Optional item to preselect and lock.
	 *
	 * @remarks
	 * When provided, the item field becomes effectively read-only in the UI.
	 */
	preselectedItemId?: string;

	/** Called after a successful pack operation. */
	onSuccess?: () => void;

	/** Called when the user cancels the form. */
	onCancel?: () => void;
};

// ─── Component ─────────────────────────────────────────────────────────────────

/**
 * Container component for packing items into a container.
 *
 * @description
 * Bridges form state, data fetching, and mutation logic. Delegates rendering
 * to {@link PackItemFormUI}.
 *
 * @remarks
 * - Prevents duplicate submissions via `isPacking`
 * - Resets server errors on user input changes
 * - Ensures UI never displays raw item IDs
 */
const PackItemForm = ({
	containerId,
	preselectedItemId,
	onSuccess,
	onCancel,
}: PackItemFormProps) => {
	const { pack, isPacking, states } = useContainerActions();
	const error = states.pack.error as HttpClientError | undefined;

	const { data: itemsData, isLoading: isLoadingItems } = useItemsList();
	const items = itemsData ?? [];

	/**
	 * Resolve display name for preselected item.
	 *
	 * @remarks
	 * Falls back to `undefined` while items are loading.
	 */
	const lockedItemName = preselectedItemId
		? items.find((item) => item.id === preselectedItemId)?.name
		: undefined;

	const form = useForm<PackItemInput, unknown, PackItemInput>({
		resolver: zodResolver(ContainerSchema.pack) as Resolver<PackItemInput>,
		defaultValues: {
			itemId: preselectedItemId ?? '',
			quantity: 1,
		},
		mode: 'onTouched',
	});

	/**
	 * Sync external preselection into form state.
	 *
	 * @remarks
	 * Avoids revalidation since value is externally controlled.
	 */
	useEffect(() => {
		if (preselectedItemId) {
			form.setValue('itemId', preselectedItemId, {
				shouldValidate: false,
			});
		}
	}, [preselectedItemId, form]);

	/**
	 * Reset server error state when user modifies the form.
	 *
	 * @remarks
	 * Prevents stale server errors from persisting after user correction.
	 */
	useEffect(() => {
		if (!error) return;
		// eslint-disable-next-line react-hooks/incompatible-library
		const { unsubscribe } = form.watch(() => {
			states.pack.reset();
		});

		return unsubscribe;
	}, [form, error, states.pack]);

	/**
	 * Handles form submission.
	 *
	 * @param values - Validated form payload
	 * @returns Promise resolved after mutation completes
	 */
	const onSubmit: SubmitHandler<PackItemInput> = async (values) => {
		if (isPacking) return;
		await pack(containerId, values, {
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
		<PackItemFormUI
			form={form}
			onSubmit={onSubmit}
			onCancel={onCancel}
			isSubmitting={isPacking}
			serverError={error?.body.message ?? null}
			serverSuggestion={error?.body.suggestion ?? null}
			items={items}
			isLoadingItems={isLoadingItems}
			lockedItemId={preselectedItemId}
			lockedItemName={lockedItemName}
		/>
	);
};

export default PackItemForm;
