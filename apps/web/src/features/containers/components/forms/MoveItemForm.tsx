'use client';

import { useEffect } from 'react';
import { type SubmitHandler, type Resolver, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { ContainerSchema } from '@beggy/shared/schemas';
import type { MoveItemInput, PackedItemDTO } from '@beggy/shared/types';

import { useContainerActions } from '@/features/containers/hooks';
import { useBagsList } from '@features/bags/hooks';
import MoveItemFormUI from './MoveItemFormUI';
import { notify } from '@shared/utils';
import type { HttpClientError } from '@shared/types';

// ─── Types ─────────────────────────────────────────────────────────────────────

type MoveItemFormProps = {
	/** The packed item being moved. */
	packedItem: PackedItemDTO;
	/** The bag the item is currently in. */
	fromContainerId: string;
	fromBagName: string;
	onSuccess?: () => void;
	onCancel?: () => void;
};

// ─── Component ─────────────────────────────────────────────────────────────────

/**
 * MoveItemForm
 *
 * Orchestrates:
 * - Form state via RHF + ContainerSchema.move
 * - Bag list from GET /bags (filtered to exclude source bag)
 * - POST /containers/move via useContainerActions.move
 *
 * fromContainerId and itemId are locked — set as hidden fields.
 * User only picks destination bag and confirms quantity.
 */
const MoveItemForm = ({
	packedItem,
	fromContainerId,
	fromBagName,
	onSuccess,
	onCancel,
}: MoveItemFormProps) => {
	const { move, states } = useContainerActions();
	const error = states.move.error as HttpClientError | undefined;

	const { data: bagsData, isLoading: isLoadingBags } = useBagsList();

	// Exclude the current bag from the destination list
	const targetBags = (bagsData ?? []).filter(
		(bag) => bag.containerId !== fromContainerId
	);

	const form = useForm<MoveItemInput, unknown, MoveItemInput>({
		resolver: zodResolver(ContainerSchema.move) as Resolver<MoveItemInput>,
		defaultValues: {
			fromContainerId,
			toContainerId: '',
			itemId: packedItem.itemId,
			quantity: packedItem.quantity,
		},
		mode: 'onChange',
	});

	// Use RHF's isSubmitting — true for the full duration of onSubmit
	const { isSubmitting } = form.formState;

	// Clear server error on next edit
	useEffect(() => {
		if (!error) return;
		// eslint-disable-next-line react-hooks/incompatible-library
		const { unsubscribe } = form.watch(() => {
			states.move.reset();
		});

		return unsubscribe;
	}, [form, error, states.move]);

	const onSubmit: SubmitHandler<MoveItemInput> = async (values) => {
		await move(values, {
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
		<MoveItemFormUI
			form={form}
			onSubmit={onSubmit}
			onCancel={onCancel}
			isSubmitting={isSubmitting}
			serverError={error?.body.message ?? null}
			serverSuggestion={error?.body.suggestion ?? null}
			itemName={packedItem.name}
			fromBagName={fromBagName}
			targetBags={targetBags}
			isLoadingBags={isLoadingBags}
		/>
	);
};

export default MoveItemForm;
