import { useCallback } from 'react';
import useContainerMutations from './useContainerMutations';
import type {
	PackItemInput,
	UnpackItemInput,
	MoveItemInput,
} from '@beggy/shared/types';
import type { HttpClientError } from '@shared/types';

type CallbackOptions = {
	onSuccess?: (message: string) => void;
	onError?: (err: unknown) => void;
};

/**
 * Feature-level action hook for Container mutations.
 *
 * @description
 * Intent-based wrappers around pack / unpack / move with
 * optional lifecycle callbacks. Matches the exact pattern
 * of `useItemActions`.
 *
 * @remarks
 * UI components call `pack`, `unpack`, `move` — they never
 * touch RTK mutation triggers directly. Toast logic lives
 * in the calling component (form containers / page), not here.
 */
const useContainerActions = () => {
	const { packItem, unpackItem, moveItem, isAnyLoading, states } =
		useContainerMutations();

	/**
	 * Pack an item into a container.
	 *
	 * @param containerId - Target container.
	 * @param body - Item id + quantity to pack.
	 */
	const pack = useCallback(
		async (
			containerId: string,
			body: PackItemInput,
			callbacks?: CallbackOptions
		) => {
			try {
				const { message } = await packItem(containerId, body).unwrap();
				callbacks?.onSuccess?.(message);
			} catch (err) {
				callbacks?.onError?.(err as HttpClientError);
			}
		},
		[packItem]
	);

	/**
	 * Unpack an item from a container.
	 *
	 * @param containerId - Source container.
	 * @param body - Item id + quantity to remove.
	 */
	const unpack = useCallback(
		async (
			containerId: string,
			body: UnpackItemInput,
			callbacks?: CallbackOptions
		) => {
			try {
				const { message } = await unpackItem(
					containerId,
					body
				).unwrap();
				callbacks?.onSuccess?.(message);
			} catch (err) {
				callbacks?.onError?.(err as HttpClientError);
			}
		},
		[unpackItem]
	);

	/**
	 * Move an item between two containers atomically.
	 *
	 * @param body - fromContainerId, toContainerId, itemId, quantity.
	 *
	 * @remarks
	 * The backend returns MoveResultDTO with both updated summaries.
	 * RTK invalidates both container tags automatically — no manual
	 * refetch needed.
	 */
	const move = useCallback(
		async (body: MoveItemInput, callbacks?: CallbackOptions) => {
			try {
				const { message } = await moveItem(body).unwrap();
				callbacks?.onSuccess?.(message);
			} catch (err) {
				callbacks?.onError?.(err as HttpClientError);
			}
		},
		[moveItem]
	);

	return {
		pack,
		unpack,
		move,

		isPacking: states.pack.isLoading,
		isUnpacking: states.unpack.isLoading,
		isMoving: states.move.isLoading,

		isAnyLoading,
		states,
	};
};

export default useContainerActions;
