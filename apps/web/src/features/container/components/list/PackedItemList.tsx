'use client';

import { useState } from 'react';
import { useDroppable } from '@dnd-kit/react';

import { ContainerStatusEmptyState } from '@features/container/components/states';
import { ContainerActionDialog } from '@features/container/components/dialogs';
import PackedItemRow from './PackedItemRow';

import { useContainerActions } from '@features/container/hooks';
import { notify } from '@shared/utils';
import type { PackedItemDTO } from '@beggy/shared/types';
import type { HttpClientError } from '@shared/types';
import { cn } from '@shadcn-lib';

// ─── Types ─────────────────────────────────────────────────────────────────────

type PackedItemListProps = {
	items: PackedItemDTO[];
	containerId: string;
	bagName: string;
	onUnpack?: (packedItem: PackedItemDTO) => void;
	onMove?: (packedItem: PackedItemDTO) => void;
};

// ─── Component ─────────────────────────────────────────────────────────────────

/**
 * PackedItemList
 *
 * Renders packed items and acts as a @dnd-kit/react Droppable zone.
 *
 * Drop zone accepts:
 * - 'library-item'  → item dragged from ItemsPanel → opens PackItemDialog (qty confirm)
 * - 'packed-item'   → packed row dragged from another bag → opens ContainerActionDialog
 *
 * onUnpack / onMove: when provided, the parent (ContainerDetailPage) owns dialog
 * state via its unified DialogState machine. When omitted, this component falls
 * back to its own local itemToMove state for backward-compat.
 */
const PackedItemList = ({
	items,
	containerId,
	bagName,
	onUnpack,
	onMove,
}: PackedItemListProps) => {
	// Local fallback state — only used when parent doesn't inject handlers
	const [itemToMove, setItemToMove] = useState<PackedItemDTO | null>(null);
	const { unpack, isUnpacking } = useContainerActions();

	const { ref, isDropTarget } = useDroppable({
		id: `container-drop-${containerId}`,
		data: { type: 'container', containerId },
	});

	const handleUnpack = async (item: PackedItemDTO) => {
		if (onUnpack) {
			onUnpack(item);
			return;
		}
		await unpack(
			containerId,
			{ itemId: item.itemId, quantity: item.quantity },
			{
				onSuccess: (message) => notify.success({ message }),
				onError: (err) => notify.error.fromHttp(err as HttpClientError),
			}
		);
	};

	const handleMove = (item: PackedItemDTO) => {
		if (onMove) {
			onMove(item);
			return;
		}
		setItemToMove(item);
	};

	// ── Empty state ───────────────────────────────────────────────────────────
	if (items.length === 0) {
		return (
			<div
				ref={ref}
				className={cn(
					'rounded-xl border-2 border-dashed p-8 transition-all duration-200',
					isDropTarget
						? 'border-primary/50 bg-primary/5 scale-[1.01]'
						: 'border-border'
				)}
				aria-label="Drop zone — drag an item here to pack it"
			>
				<ContainerStatusEmptyState />
			</div>
		);
	}

	return (
		<>
			<div
				ref={ref}
				role="list"
				aria-label="Packed items"
				className={cn(
					'flex flex-col gap-1.5 rounded-xl transition-all duration-200',
					isDropTarget &&
						'bg-primary/5 ring-2 ring-primary/20 p-2 rounded-xl'
				)}
			>
				{items.map((item, index) => (
					<div
						key={item.itemId}
						role="listitem"
						style={{ animationDelay: `${index * 30}ms` }}
					>
						<PackedItemRow
							item={item}
							containerId={containerId}
							onUnpack={handleUnpack}
							onMove={handleMove}
							isUnpacking={isUnpacking}
						/>
					</div>
				))}
			</div>

			{/* Local fallback dialog — only mounts when parent doesn't own move state */}
			{itemToMove && !onMove && (
				<ContainerActionDialog
					mode="move"
					packedItem={itemToMove}
					fromContainerId={containerId}
					fromBagName={bagName}
					open
					onOpenChange={(open) => !open && setItemToMove(null)}
					onSuccess={() => setItemToMove(null)}
				/>
			)}
		</>
	);
};

export default PackedItemList;
