'use client';

import { ManagedFormDialog } from '@shared-ui/dialogs';
import {
	PackItemForm,
	UnpackItemForm,
	MoveItemForm,
} from '@features/container/components/forms';
import type { PackedItemDTO } from '@beggy/shared/types';

// ─── Types ─────────────────────────────────────────────────────────────────────

/**
 * Pack mode configuration.
 */
type PackMode = {
	mode: 'pack';
	containerId: string;
	/**
	 * Optional item preselected via drag-and-drop.
	 *
	 * @remarks
	 * `null` indicates manual selection mode.
	 */
	droppedItemId: string | null;
};

/**
 * Unpack mode configuration.
 */
type UnpackMode = {
	mode: 'unpack';
	containerId: string;
	packedItem: PackedItemDTO;
};

/**
 * Move mode configuration.
 */
type MoveMode = {
	mode: 'move';
	packedItem: PackedItemDTO;
	fromContainerId: string;
	fromBagName: string;
};

/**
 * Discriminated union for all supported container dialog modes.
 *
 * @description
 * Ensures each mode receives only the props it requires,
 * preventing invalid runtime states.
 */
type ContainerDialogMode = PackMode | UnpackMode | MoveMode;

/**
 * Props for {@link ContainerActionDialog}.
 */
type ContainerActionDialogProps = ContainerDialogMode & {
	open: boolean;

	/**
	 * Controls dialog visibility.
	 */
	onOpenChange: (open: boolean) => void;

	/**
	 * Called after a successful action (pack, unpack, move).
	 */
	onSuccess: () => void;
};

// ─── Title map ────────────────────────────────────────────────────────────────

/**
 * Maps dialog mode to display title.
 */
const DIALOG_TITLES: Record<ContainerDialogMode['mode'], string> = {
	pack: 'Pack item',
	unpack: 'Remove item',
	move: 'Move item',
};

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * Unified dialog for container item actions.
 *
 * @description
 * Centralized entry point that renders the appropriate form based on `mode`.
 * Delegates all business logic to form container components.
 *
 * @remarks
 * - Guarantees correct prop shape via discriminated union
 * - Normalizes success behavior (close dialog + propagate event)
 * - Keeps dialog concerns decoupled from form implementations
 *
 * @example
 * // Pack via drag-and-drop
 * <ContainerActionDialog
 *   mode="pack"
 *   containerId={containerId}
 *   droppedItemId={droppedItemId}
 *   open={open}
 *   onOpenChange={setOpen}
 *   onSuccess={() => setDroppedItemId(null)}
 * />
 *
 * @example
 * // Unpack item
 * <ContainerActionDialog
 *   mode="unpack"
 *   containerId={containerId}
 *   packedItem={item}
 *   open={open}
 *   onOpenChange={setOpen}
 *   onSuccess={() => {}}
 * />
 *
 * @example
 * // Move item
 * <ContainerActionDialog
 *   mode="move"
 *   packedItem={item}
 *   fromContainerId={containerId}
 *   fromBagName={containerName}
 *   open={open}
 *   onOpenChange={setOpen}
 *   onSuccess={() => {}}
 * />
 */
const ContainerActionDialog = ({
	open,
	onOpenChange,
	onSuccess,
	...modeProps
}: ContainerActionDialogProps) => {
	const title = DIALOG_TITLES[modeProps.mode];

	return (
		<ManagedFormDialog
			open={open}
			onOpenChange={onOpenChange}
			title={title}
			size="sm"
			scrollable={false}
			form={(onCancel) => {
				const handleSuccess = () => {
					onCancel();
					onSuccess();
				};

				if (modeProps.mode === 'pack') {
					// Pack: only render form when an item is known
					// (null droppedItemId = manual add, no pre-selection)
					return (
						<PackItemForm
							containerId={modeProps.containerId}
							preselectedItemId={
								modeProps.droppedItemId ?? undefined
							}
							onCancel={onCancel}
							onSuccess={handleSuccess}
						/>
					);
				}

				if (modeProps.mode === 'unpack') {
					return (
						<UnpackItemForm
							containerId={modeProps.containerId}
							packedItem={modeProps.packedItem}
							onCancel={onCancel}
							onSuccess={handleSuccess}
						/>
					);
				}

				// mode === 'move'
				return (
					<MoveItemForm
						packedItem={modeProps.packedItem}
						fromContainerId={modeProps.fromContainerId}
						fromBagName={modeProps.fromBagName}
						onCancel={onCancel}
						onSuccess={handleSuccess}
					/>
				);
			}}
		/>
	);
};

export default ContainerActionDialog;
