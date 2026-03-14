'use client';

import { type ReactElement } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { Add01Icon } from '@hugeicons/core-free-icons';

import { Button } from '@shadcn-ui/button';
import { FormDialog } from '@shared-ui/dialogs';

import { CreateItemForm } from '@features/items/components/forms';

// ─────────────────────────────────────────────────────────────────────────────
// CreateItemDialog
// ─────────────────────────────────────────────────────────────────────────────

type CreateItemDialogProps = {
	/**
	 * Called after a successful create.
	 * Use to refetch the list, show a toast, navigate, etc.
	 */
	onSuccess?: () => void;

	/**
	 * Custom trigger element.
	 * Defaults to the standard "Add item" Button used on ItemsPage.
	 */
	trigger?: ReactElement;
};

/**
 * CreateItemDialog
 *
 * Self-contained dialog for creating a new item.
 * Owns its own open/close state via FormDialog.
 *
 * The dialog closes on:
 * - Cancel button click (via onCancel → FormDialog.handleCancel)
 * - Successful mutation (via onSuccess → same close function)
 *
 * @example — ItemsPage header button (default trigger)
 * <CreateItemDialog onSuccess={refetch} />
 *
 * @example — Custom trigger
 * <CreateItemDialog
 *   trigger={<Button variant="outline" size="sm">New item</Button>}
 *   onSuccess={refetch}
 * />
 */
const CreateItemDialog = ({ onSuccess, trigger }: CreateItemDialogProps) => {
	return (
		<FormDialog
			trigger={
				trigger ?? (
					<Button>
						<HugeiconsIcon icon={Add01Icon} className="h-4 w-4" />
						Add item
					</Button>
				)
			}
			form={(onCancel) => (
				<CreateItemForm
					onCancel={onCancel}
					onSuccess={() => {
						onCancel(); // close the dialog
						onSuccess?.(); // then notify the parent
					}}
				/>
			)}
		/>
	);
};

export default CreateItemDialog;
