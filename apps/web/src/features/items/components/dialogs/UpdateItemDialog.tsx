'use client';

import { ManagedFormDialog } from '@shared-ui/dialogs';

import { UpdateItemForm } from '@features/items/components/forms';

import type { ItemDTO } from '@beggy/shared/types';

// ─────────────────────────────────────────────────────────────────────────────
// UpdateItemDialog
// ─────────────────────────────────────────────────────────────────────────────

type UpdateItemDialogProps = {
	/**
	 * The item being edited.
	 * When null → dialog is closed.
	 * When set  → dialog opens, form pre-populated.
	 *
	 * This is the controlled pattern used across pages:
	 * - ItemsPage:        item comes from itemToEdit state + grid's onEdit callback
	 * - ItemDetailsPage:  item comes from loaded item data, gated by editOpen boolean
	 */
	item: ItemDTO | null;

	/**
	 * Called when the dialog should close.
	 * Set your item state to null or your boolean to false:
	 *
	 * onClose={() => setItemToEdit(null)}
	 * onClose={() => setEditOpen(false)}
	 */
	onClose: () => void;

	/**
	 * Called after a successful update.
	 * The dialog is already closed before this fires.
	 * Use to refetch data, show a toast, etc.
	 */
	onSuccess?: () => void;
};

/**
 * UpdateItemDialog
 *
 * Controlled dialog for editing an existing item.
 * Uses ControlledFormDialog — no trigger, opened by the parent.
 *
 * The dialog closes on:
 * - Cancel button click  → onClose()
 * - Successful mutation  → onClose() then onSuccess()
 * - Escape / backdrop    → onClose() via onOpenChange
 *
 * @example — ItemsPage (nullable item drives open state)
 * const [itemToEdit, setItemToEdit] = useState<ItemDTO | null>(null);
 *
 * <ItemsGrid onEdit={(item) => setItemToEdit(item)} />
 * <UpdateItemDialog
 *   item={itemToEdit}
 *   onClose={() => setItemToEdit(null)}
 *   onSuccess={refetch}
 * />
 *
 * @example — ItemDetailsPage (boolean open state)
 * const [editOpen, setEditOpen] = useState(false);
 *
 * <Button onClick={() => setEditOpen(true)}>Edit</Button>
 * <UpdateItemDialog
 *   item={editOpen ? item : null}
 *   onClose={() => setEditOpen(false)}
 *   onSuccess={refetch}
 * />
 */
const UpdateItemDialog = ({
	item,
	onClose,
	onSuccess,
}: UpdateItemDialogProps) => {
	return (
		<ManagedFormDialog
			open={!!item}
			onOpenChange={(open) => {
				if (!open) onClose();
			}}
			title={item ? `Edit ${item.name}` : 'Edit item'}
			form={(onCancel) =>
				/*
				 * Conditional render — UpdateItemForm needs item to exist.
				 * The dialog's open state handles visibility, but the form
				 * must not render with item=null even during the close animation.
				 * Unmounting on close ensures the form always initialises fresh
				 * from the correct item on next open.
				 */
				item && (
					<UpdateItemForm
						item={item}
						onCancel={onCancel}
						onSuccess={() => {
							onCancel(); // close first
							onSuccess?.(); // then notify parent
						}}
					/>
				)
			}
		/>
	);
};

export default UpdateItemDialog;
