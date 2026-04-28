'use client';

import { useEffect } from 'react';
import { type SubmitHandler, type Resolver, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { ContainerSchema } from '@beggy/shared/schemas';
import type { UnpackItemInput, PackedItemDTO } from '@beggy/shared/types';

import { useContainerActions } from '@/features/containers/hooks';
import UnpackItemFormUI from './UnpackItemFormUI';
import { notify } from '@shared/utils';
import type { HttpClientError } from '@shared/types';

// ─── Types ─────────────────────────────────────────────────────────────────────

/**
 * Props for {@link UnpackItemForm}.
 *
 * @description
 * Defines the external contract for removing an item from a container.
 */
type UnpackItemFormProps = {
	/** Target container identifier. */
	containerId: string;

	/**
	 * Packed item snapshot.
	 *
	 * @remarks
	 * Provides both identity and constraints (e.g. max quantity).
	 */
	packedItem: PackedItemDTO;

	/** Called after a successful unpack operation. */
	onSuccess?: () => void;

	/** Called when the user cancels the form. */
	onCancel?: () => void;
};

// ─── Component ─────────────────────────────────────────────────────────────────

/**
 * Container component for unpacking an item.
 *
 * @description
 * Coordinates form state, mutation execution, and UI feedback.
 * Delegates rendering to {@link UnpackItemFormUI}.
 *
 * @remarks
 * - Item is immutable (pre-locked)
 * - Quantity must not exceed `packedItem.quantity`
 * - Resets server errors on user interaction
 */
const UnpackItemForm = ({
	containerId,
	packedItem,
	onSuccess,
	onCancel,
}: UnpackItemFormProps) => {
	const { unpack, isUnpacking, states } = useContainerActions();
	/**
	 * Latest server error from unpack mutation.
	 */
	const error = states.unpack.error as HttpClientError | undefined;

	const form = useForm<UnpackItemInput, unknown, UnpackItemInput>({
		resolver: zodResolver(
			ContainerSchema.unpack
		) as Resolver<UnpackItemInput>,
		defaultValues: {
			itemId: packedItem.itemId,
			quantity: packedItem.quantity,
		},
		mode: 'onTouched',
	});

	/**
	 * Reset server error when the user modifies the form.
	 *
	 * @remarks
	 * Prevents stale errors after corrective input.
	 */
	useEffect(() => {
		if (!error) return;
		// eslint-disable-next-line react-hooks/incompatible-library
		const { unsubscribe } = form.watch(() => {
			states.unpack.reset();
		});

		return unsubscribe;
	}, [form, error, states.unpack]);

	/**
	 * Handles form submission.
	 *
	 * @param values - Validated form payload
	 */
	const onSubmit: SubmitHandler<UnpackItemInput> = async (values) => {
		if (isUnpacking) return;
		await unpack(containerId, values, {
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
		<UnpackItemFormUI
			form={form}
			onSubmit={onSubmit}
			onCancel={onCancel}
			isSubmitting={isUnpacking}
			serverError={error?.body.message ?? null}
			serverSuggestion={error?.body.suggestion ?? null}
			itemName={packedItem.name}
			maxQuantity={packedItem.quantity}
		/>
	);
};

export default UnpackItemForm;
