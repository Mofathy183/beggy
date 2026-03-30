'use client';

import { ManagedFormDialog } from '@shared-ui/dialogs';

import { UpdateBagForm } from '@features/bags/components/forms';

import type { BagDTO } from '@beggy/shared/types';

// ─────────────────────────────────────────────────────────────────────────────
// UpdateBagDialog
// ─────────────────────────────────────────────────────────────────────────────

type UpdateBagDialogProps = {
	/**
	 * The bag being edited.
	 * When null  → dialog is closed.
	 * When set   → dialog opens with the form pre-populated.
	 *
	 * Controlled pattern used across two call sites:
	 * - BagsPage:        bag comes from bagToEdit state + grid's onEdit callback
	 * - BagDetailsPage:  bag comes from loaded bag data, gated by editOpen boolean
	 */
	bag: BagDTO | null;

	/**
	 * Called when the dialog should close.
	 * Set your state back to null or false:
	 *
	 * onClose={() => setBagToEdit(null)}
	 * onClose={() => setEditOpen(false)}
	 */
	onClose: () => void;

	/**
	 * Called after a successful update.
	 * The dialog is already closed before this fires.
	 * Use to refetch data, show a toast, navigate, etc.
	 */
	onSuccess?: () => void;
};

/**
 * UpdateBagDialog
 *
 * Controlled dialog for editing an existing bag.
 * Uses ManagedFormDialog — no trigger button, opened by the parent.
 *
 * The dialog closes on:
 * - Cancel button click  → onClose()
 * - Successful mutation  → onClose() then onSuccess()
 * - Escape / backdrop    → onClose() via onOpenChange
 *
 * @example — BagsPage (nullable bag drives open state)
 * const [bagToEdit, setBagToEdit] = useState<BagDTO | null>(null);
 *
 * <BagsGrid onEdit={(bag) => setBagToEdit(bag)} />
 * <UpdateBagDialog
 *   bag={bagToEdit}
 *   onClose={() => setBagToEdit(null)}
 *   onSuccess={refetch}
 * />
 *
 * @example — BagDetailsPage (boolean open state)
 * const [editOpen, setEditOpen] = useState(false);
 *
 * <Button onClick={() => setEditOpen(true)}>Edit</Button>
 * <UpdateBagDialog
 *   bag={editOpen ? bag : null}
 *   onClose={() => setEditOpen(false)}
 *   onSuccess={refetch}
 * />
 */
const UpdateBagDialog = ({ bag, onClose, onSuccess }: UpdateBagDialogProps) => {
	return (
		<ManagedFormDialog
			open={!!bag}
			onOpenChange={(open) => {
				if (!open) onClose();
			}}
			title={bag ? `Edit ${bag.name}` : 'Edit bag'}
			size="md"
			form={(onCancel) =>
				/*
				 * Conditional render — UpdateBagForm requires bag to exist.
				 * Unmounting on close guarantees the form always re-initialises
				 * fresh from the correct bag data on next open, preventing
				 * stale defaultValues from a previous selection.
				 */
				bag && (
					<UpdateBagForm
						bag={bag}
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

export default UpdateBagDialog;
