import {
	usePackItemMutation,
	useUnpackItemMutation,
	useMoveItemMutation,
} from '@features/container/api';
import type {
	PackItemInput,
	UnpackItemInput,
	MoveItemInput,
} from '@beggy/shared/types';

/**
 * Thin adapter between the RTK Query API layer and the
 * intent-based `useContainerActions` hook.
 *
 * @remarks
 * Mirrors the pattern in `useItemMutations` — raw mutation
 * triggers + grouped states, no business logic here.
 */
const useContainerMutations = () => {
	const [packItem, packState] = usePackItemMutation();
	const [unpackItem, unpackState] = useUnpackItemMutation();
	const [moveItem, moveState] = useMoveItemMutation();

	return {
		packItem: (containerId: string, body: PackItemInput) =>
			packItem({ containerId, body }),

		unpackItem: (containerId: string, body: UnpackItemInput) =>
			unpackItem({ containerId, body }),

		moveItem: (body: MoveItemInput) => moveItem(body),

		states: {
			pack: packState,
			unpack: unpackState,
			move: moveState,
		},

		isAnyLoading:
			packState.isLoading || unpackState.isLoading || moveState.isLoading,
	};
};

export default useContainerMutations;
