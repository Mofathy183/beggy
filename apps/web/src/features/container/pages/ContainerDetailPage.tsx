'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
	DragDropProvider,
	DragOverlay,
	useDragOperation,
} from '@dnd-kit/react';
import { PointerSensor, PointerActivationConstraints } from '@dnd-kit/dom';
import { HugeiconsIcon } from '@hugeicons/react';
import {
	Backpack01Icon,
	Add01Icon,
	ArrowLeft01Icon,
	Luggage01Icon,
} from '@hugeicons/core-free-icons';

import { Button } from '@shadcn-ui/button';
import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from '@shadcn-ui/sheet';
import { Skeleton } from '@shadcn-ui/skeleton';

import { ContainerStatusPanel } from '@features/container/components/visualization';
import { PackedItemList } from '@features/container/components/list';
import { ItemsPanel } from '@features/container/components/visualization';
import { ContainerActionDialog } from '@features/container/components/dialogs';

import { useContainerState } from '@features/container/hooks';
import type { ContainerStateDTO, PackedItemDTO } from '@beggy/shared/types';
import { ContainerType } from '@beggy/shared/constants';

// ─── Types ─────────────────────────────────────────────────────────────────────

/**
 * Props required to render a container packing workspace.
 *
 * @remarks
 * This component is intentionally **data-light** and expects
 * pre-fetched metadata (name, limits) to avoid blocking UI rendering.
 */
type ContainerDetailPageProps = {
	containerId: string;
	containerName: string;
	containerType: ContainerType;
	maxWeight: number;
	maxCapacity: number;
	weightUnit?: string;
	capacityUnit?: string;
	backHref?: string;
};

// ─── Dialog state ──────────────────────────────────────────────────────────────

/**
 * Controls the active container action dialog.
 *
 * @remarks
 * Discriminated union ensures mutually exclusive dialog states.
 */
type DialogState =
	| { mode: 'closed' }
	| { mode: 'pack'; droppedItemId: string | null }
	| { mode: 'unpack'; packedItem: PackedItemDTO }
	| { mode: 'move'; packedItem: PackedItemDTO };

// ─── Drag ghost ────────────────────────────────────────────────────────────────

/**
 * Visual representation of the dragged item.
 *
 * @remarks
 * Relies on dnd-kit `source.data` contract.
 * Falls back to generic labels if metadata is missing.
 */
const DragGhost = () => {
	const { source } = useDragOperation();
	if (!source) return null;

	const data = source.data as {
		type: 'library-item' | 'packed-item';
		item?: { name: string };
	};

	const label =
		data?.item?.name ??
		(data.type === 'library-item' ? 'Item' : 'Packed item');

	return (
		<div className="bg-card text-card-foreground pointer-events-none select-none rounded-lg border px-4 py-2.5 text-sm font-medium shadow-lg">
			{label}
		</div>
	);
};

// ─── Manual pack button ─────────────────────────────────────────────────────────

/**
 * Triggers manual pack flow (without drag interaction).
 */
const ManualPackButton = ({ onOpen }: { onOpen: () => void }) => (
	<Button className="flex-1" onClick={onOpen}>
		<HugeiconsIcon icon={Add01Icon} className="h-4 w-4" />
		Add item
	</Button>
);

// ─── Page ───────────────────────────────────────────────────────────────────────

/**
 * Container packing workspace.
 *
 * @remarks
 * Responsibilities:
 * - Render container status and packed items
 * - Handle drag-and-drop packing interactions
 * - Coordinate pack/unpack/move dialog flows
 *
 * Drag-and-drop contract:
 * - Accepts drops only when `target.type === 'container'`
 * - Requires `target.containerId` to match current container
 * - Supports packing from "library-item" sources
 */
const ContainerDetailPage = ({
	containerId,
	containerName,
	containerType,
	maxWeight,
	maxCapacity,
	weightUnit = 'kg',
	capacityUnit = 'L',
	backHref,
}: ContainerDetailPageProps) => {
	const router = useRouter();
	const { containerState, isLoading } = useContainerState(containerId);

	const [dialog, setDialog] = useState<DialogState>({ mode: 'closed' });

	const isBag = containerType === ContainerType.BAG;

	const openPackDialog = (droppedItemId: string | null = null) =>
		setDialog({ mode: 'pack', droppedItemId });

	const openUnpackDialog = (packedItem: PackedItemDTO) =>
		setDialog({ mode: 'unpack', packedItem });

	const openMoveDialog = (packedItem: PackedItemDTO) =>
		setDialog({ mode: 'move', packedItem });

	const closeDialog = () => setDialog({ mode: 'closed' });

	/**
	 * Handles drop interactions from the item library into the container.
	 *
	 * @param event - Drag operation result from dnd-kit
	 *
	 * @remarks
	 * - Ignores canceled or incomplete operations
	 * - Ensures drop target matches current container
	 * - Only supports packing from "library-item" sources
	 *
	 * @risk
	 * Relies on untyped `source.data` / `target.data` contracts.
	 * Invalid shapes may silently fail.
	 */
	const handleDragEnd = (event: {
		operation: {
			source?: { data?: unknown } | null;
			target?: { data?: unknown } | null;
		};
		canceled: boolean;
	}) => {
		if (event.canceled) return;

		const operation = event.operation;
		if (!operation.source || !operation.target) return;

		const sourceData = operation.source.data as
			| { type?: string; itemId?: string; item?: { id?: string } }
			| undefined;

		const targetData = operation.target.data as
			| { type?: string; containerId?: string }
			| undefined;

		if (
			targetData?.type !== 'container' ||
			targetData?.containerId !== containerId
		) {
			return;
		}

		if (sourceData?.type === 'library-item') {
			const itemId = sourceData.itemId ?? sourceData.item?.id;
			if (itemId) {
				openPackDialog(itemId);
			}
		}
	};

	if (isLoading) {
		return (
			<div className="flex flex-col gap-4 p-4">
				<Skeleton className="h-10 w-48 rounded-lg" />
				<Skeleton className="h-40 w-full rounded-xl" />
				<Skeleton className="h-12 w-full rounded-lg" />
				<Skeleton className="h-12 w-full rounded-lg" />
			</div>
		);
	}

	const containerDto = containerState as ContainerStateDTO | null;
	const packedItems = containerDto?.items ?? [];

	return (
		<DragDropProvider
			onDragEnd={handleDragEnd}
			sensors={[
				PointerSensor.configure({
					activationConstraints: [
						new PointerActivationConstraints.Distance({
							value: 8,
						}),
					],
				}),
			]}
		>
			<div className="flex flex-col gap-6 p-4 pb-24">
				{/* ── Page header ──────────────────────────────────── */}
				<div className="flex items-center gap-3">
					{backHref && (
						<Button
							variant="ghost"
							size="icon"
							aria-label="Back to details"
							onClick={() => router.push(backHref)}
						>
							<HugeiconsIcon
								icon={ArrowLeft01Icon}
								className="h-4 w-4"
							/>
						</Button>
					)}

					<HugeiconsIcon
						icon={isBag ? Backpack01Icon : Luggage01Icon}
						className="text-muted-foreground h-5 w-5 shrink-0"
						aria-hidden="true"
					/>

					<div>
						<h1 className="text-foreground text-lg font-semibold leading-tight">
							{containerName}
						</h1>
						<p className="text-muted-foreground text-xs">
							Packing workspace
						</p>
					</div>
				</div>

				{/* ── Status panel ─────────────────────────────────── */}
				<ContainerStatusPanel
					status={containerDto?.status ?? null}
					maxWeight={maxWeight}
					maxCapacity={maxCapacity}
					weightUnit={weightUnit}
					capacityUnit={capacityUnit}
					variant="full"
					containerLabel={isBag ? 'bag' : 'suitcase'}
				/>

				{/* ── Packed items ─────────────────────────────────── */}
				<section aria-label="Packed items">
					<h2 className="text-muted-foreground mb-3 text-sm font-medium">
						{packedItems.length > 0
							? `${packedItems.length} item${packedItems.length !== 1 ? 's' : ''} packed`
							: 'Nothing packed yet'}
					</h2>
					<PackedItemList
						items={packedItems}
						containerId={containerId}
						bagName={containerName}
						onUnpack={openUnpackDialog}
						onMove={openMoveDialog}
					/>
				</section>
			</div>

			{/* ── Fixed footer ───────────────────────────────────────── */}
			<div className="border-t bg-background fixed inset-x-0 bottom-0 z-10 flex items-center gap-3 px-4 py-3">
				<ManualPackButton onOpen={() => openPackDialog(null)} />

				<Sheet>
					<SheetTrigger
						render={
							<Button variant="outline" className="flex-1">
								<HugeiconsIcon
									icon={
										isBag ? Backpack01Icon : Luggage01Icon
									}
									className="h-4 w-4"
								/>
								My items
							</Button>
						}
					/>
					<SheetContent side="bottom" className="w-full sm:w-96">
						<SheetHeader>
							<SheetTitle>Your items</SheetTitle>
						</SheetHeader>
						<ItemsPanel containerId={containerId} />
					</SheetContent>
				</Sheet>
			</div>

			{/* ── Unified dialog ─────────────────────────────────────── */}
			{dialog.mode === 'pack' && (
				<ContainerActionDialog
					mode="pack"
					containerId={containerId}
					droppedItemId={dialog.droppedItemId}
					open
					onOpenChange={(open) => !open && closeDialog()}
					onSuccess={closeDialog}
				/>
			)}
			{dialog.mode === 'unpack' && (
				<ContainerActionDialog
					mode="unpack"
					containerId={containerId}
					packedItem={dialog.packedItem}
					open
					onOpenChange={(open) => !open && closeDialog()}
					onSuccess={closeDialog}
				/>
			)}
			{dialog.mode === 'move' && (
				<ContainerActionDialog
					mode="move"
					packedItem={dialog.packedItem}
					fromContainerId={containerId}
					fromBagName={containerName}
					open
					onOpenChange={(open) => !open && closeDialog()}
					onSuccess={closeDialog}
				/>
			)}

			{/* ── Drag ghost ─────────────────────────────────────────── */}
			<DragOverlay dropAnimation={null}>
				<DragGhost />
			</DragOverlay>
		</DragDropProvider>
	);
};

export default ContainerDetailPage;
