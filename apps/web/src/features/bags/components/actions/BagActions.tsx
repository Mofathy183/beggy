'use client';

import {
	PencilEdit02Icon,
	Delete02Icon,
	ArrowBigRight,
} from '@hugeicons/core-free-icons';

import ActionsMenu from '@shared-ui/actions/ActionsMenu';
import type { BagDTO } from '@beggy/shared/types';

// ─── Types ─────────────────────────────────────────────────────────────────────

type BagActionsProps = {
	/** The bag this action menu belongs to. */
	bag: BagDTO;

	onSelect: () => void;

	/** Called when the user selects "Edit" */
	onEdit: () => void;

	/** Called when the user selects "Delete" */
	onDelete: () => void;

	/** Disables the edit action (e.g. while an update mutation is in-flight) */
	isUpdating?: boolean;

	/** Disables the delete action (e.g. while a delete mutation is in-flight) */
	isDeleting?: boolean;
};

// ─── Component ─────────────────────────────────────────────────────────────────

/**
 * BagActions
 *
 * @description
 * Composes the generic `ActionsMenu` with bag-specific actions.
 *
 * @remarks
 * - Contains no business logic — all logic lives in `useBagActions`.
 * - All handlers are injected from the parent (card, list row, detail page)
 *   so this component stays purely presentational.
 * - Delete uses `variant: 'destructive'` with a separator above it to signal
 *   irreversibility and visually separate it from safe actions.
 * - "Pack bag" / "Add to Suitcase" action slots can be added above the
 *   separator when the container feature is implemented.
 *
 * @example
 * ```tsx
 * <BagActions
 *   bag={bag}
 *   onEdit={() => setBagToEdit(bag)}
 *   onDelete={() => handleDelete(bag.id)}
 *   isDeleting={isDeleting}
 * />
 * ```
 */
const BagActions = ({
	onSelect,
	onEdit,
	onDelete,
	isUpdating = false,
	isDeleting = false,
}: BagActionsProps) => {
	return (
		<ActionsMenu
			items={[
				{
					id: 'open',
					label: 'Open bag',
					icon: ArrowBigRight,
					onSelect,
					disabled: isUpdating || isDeleting,
				},
				{
					id: 'edit',
					label: 'Edit bag',
					icon: PencilEdit02Icon,
					onSelect: onEdit,
					loading: isUpdating,
					disabled: isUpdating || isDeleting,
				},
				{
					id: 'delete',
					label: 'Delete bag',
					icon: Delete02Icon,
					onSelect: onDelete,
					variant: 'destructive',
					showSeparatorBefore: true,
					loading: isDeleting,
					disabled: isUpdating || isDeleting,
				},
			]}
		/>
	);
};

export default BagActions;
