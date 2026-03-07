import { PencilEdit02Icon, Delete02Icon } from '@hugeicons/core-free-icons';

import ActionsMenu from '@shared-ui/actions/ActionsMenu';
import type { ItemDTO } from '@beggy/shared/types';

// ─── Types ─────────────────────────────────────────────────────────────────────

type ItemActionsProps = {
	item: ItemDTO;
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
 * ItemActions
 *
 * @description
 * Composes the generic `ActionsMenu` with item-specific actions.
 *
 * @remarks
 * - Contains no business logic — all logic lives in `useItemActions`.
 * - Action handlers are passed in from the parent (card or list row),
 *   keeping this component purely presentational.
 * - Delete uses `variant: 'destructive'` with a separator to signal
 *   irreversibility and separate it visually from safe actions.
 * - "Add to Bag" and "Add to Suitcase" slots are reserved for when
 *   the container features are implemented — the separator will
 *   group them naturally above the destructive delete action.
 *
 * @example
 * ```tsx
 * <ItemActions
 *   item={item}
 *   onEdit={() => openEditDialog(item)}
 *   onDelete={() => handleDelete(item.id)}
 *   isDeleting={isDeleting}
 * />
 * ```
 */
const ItemActions = ({
	onEdit,
	onDelete,
	isUpdating = false,
	isDeleting = false,
}: ItemActionsProps) => {
	return (
		<ActionsMenu
			items={[
				{
					id: 'edit',
					label: 'Edit item',
					icon: PencilEdit02Icon,
					onSelect: onEdit,
					loading: isUpdating,
					disabled: isUpdating || isDeleting,
				},
				{
					id: 'delete',
					label: 'Delete item',
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

export default ItemActions;
