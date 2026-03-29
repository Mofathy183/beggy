'use client';

import { type ReactElement } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { Add01Icon } from '@hugeicons/core-free-icons';

import { Button } from '@shadcn-ui/button';
import { FormDialog } from '@shared-ui/dialogs';

import { CreateBagForm } from '@features/bags/components/forms';

// ─────────────────────────────────────────────────────────────────────────────
// CreateBagDialog
// ─────────────────────────────────────────────────────────────────────────────

type CreateBagDialogProps = {
	/**
	 * Called after a successful create.
	 * Use to refetch the list, show a toast, navigate, etc.
	 */
	onSuccess?: () => void;

	/**
	 * Custom trigger element.
	 * Defaults to the standard "Add bag" Button used on BagsPage.
	 */
	trigger?: ReactElement;
};

/**
 * CreateBagDialog
 *
 * Self-contained dialog for creating a new bag.
 * Owns its own open/close state via FormDialog — no open prop needed.
 *
 * The dialog closes on:
 * - Cancel button click  → onCancel → FormDialog.handleCancel
 * - Successful mutation  → onCancel() first, then onSuccess()
 *
 * @example — BagsPage header button (default trigger)
 * <CreateBagDialog onSuccess={refetch} />
 *
 * @example — Custom trigger
 * <CreateBagDialog
 *   trigger={<Button variant="outline" size="sm">New bag</Button>}
 *   onSuccess={refetch}
 * />
 */
const CreateBagDialog = ({ onSuccess, trigger }: CreateBagDialogProps) => {
	return (
		<FormDialog
			size="md"
			trigger={
				trigger ?? (
					<Button>
						<HugeiconsIcon icon={Add01Icon} className="h-4 w-4" />
						Add bag
					</Button>
				)
			}
			form={(onCancel) => (
				<CreateBagForm
					onCancel={onCancel}
					onSuccess={() => {
						onCancel(); // close the dialog first
						onSuccess?.(); // then notify the parent
					}}
				/>
			)}
		/>
	);
};

export default CreateBagDialog;
