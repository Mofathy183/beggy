'use client';

import { useDraggable } from '@dnd-kit/react';
import { HugeiconsIcon } from '@hugeicons/react';
import { Move01Icon, Delete01Icon } from '@hugeicons/core-free-icons';

import { Button } from '@shadcn-ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@shadcn-ui/tooltip';
import { ContainerMetricBadge } from '@/features/containers/components/badges';
import {
	ItemCategoryBadge,
	ItemFragileBadge,
} from '@features/items/components/badges';
import { WEIGHT_UNIT_META } from '@shared-ui/mappers';
import type { PackedItemDTO } from '@beggy/shared/types';
import { cn } from '@shadcn-lib';

// ─── Types ─────────────────────────────────────────────────────────────────────

type PackedItemRowProps = {
	item: PackedItemDTO;
	containerId: string;
	onUnpack: (item: PackedItemDTO) => void;
	onMove: (item: PackedItemDTO) => void;
	isUnpacking?: boolean;
};

// ─── Component ─────────────────────────────────────────────────────────────────

/**
 * Displays a packed item with drag-and-drop and action controls.
 *
 * @remarks
 * - Supports dragging via a dedicated handle (not the full row)
 * - Emits drag metadata used for cross-container move operations
 * - Provides unpack and move actions via callbacks
 *
 * Drag contract:
 * - `data.type = 'packed-item'`
 * - Includes `item` and `fromContainerId`
 */
const PackedItemRow = ({
	item,
	containerId,
	onUnpack,
	onMove,
	isUnpacking,
}: PackedItemRowProps) => {
	const { ref, handleRef, isDragging } = useDraggable({
		id: `packed-${item.itemId}-${containerId}`,
		data: {
			type: 'packed-item',
			item,
			fromContainerId: containerId,
		},
	});

	return (
		<div
			ref={ref}
			className={cn(
				// Base layout
				'group relative flex items-center gap-3 rounded-xl px-3 py-3',
				// Surface
				'bg-card border border-border/60',
				// Hover
				'hover:border-border hover:shadow-sm',
				// Transition
				'transition-all duration-150',
				// Drag state
				isDragging &&
					'opacity-40 shadow-lg ring-2 ring-primary/30 scale-[0.98]'
			)}
			aria-label={`Packed item: ${item.name}, quantity ${item.quantity}`}
		>
			{/* ── Drag handle ───────────────────────────────────────────────── */}
			<div
				ref={handleRef}
				className={cn(
					'shrink-0 cursor-grab active:cursor-grabbing touch-none',
					'text-muted-foreground/40 hover:text-muted-foreground',
					'transition-colors duration-100',
					'opacity-0 group-hover:opacity-100'
				)}
				aria-label="Drag to move to another bag"
				aria-roledescription="Sortable"
			>
				<svg
					width="14"
					height="14"
					viewBox="0 0 14 14"
					fill="currentColor"
					aria-hidden="true"
				>
					<circle cx="4" cy="3" r="1.2" />
					<circle cx="4" cy="7" r="1.2" />
					<circle cx="4" cy="11" r="1.2" />
					<circle cx="10" cy="3" r="1.2" />
					<circle cx="10" cy="7" r="1.2" />
					<circle cx="10" cy="11" r="1.2" />
				</svg>
			</div>
			{/* ── Quantity pill ─────────────────────────────────────────────── */}
			<div
				className={cn(
					'shrink-0 flex items-center justify-center',
					'h-8 w-8 rounded-lg',
					'bg-primary/10 text-primary',
					'text-sm font-semibold tabular-nums'
				)}
				aria-label={`Quantity: ${item.quantity}`}
			>
				{item.quantity > 1 && '×'}
				{item.quantity}
			</div>
			{/* ── Name + metadata row ───────────────────────────────────────── */}
			<div className="flex-1 min-w-0 flex flex-col gap-1">
				{/* Name */}
				<p className="text-sm font-medium text-foreground truncate leading-tight">
					{item.name}
				</p>

				{/* Badges row */}
				<div className="flex items-center gap-1.5 flex-wrap">
					{item.category && (
						<ItemCategoryBadge
							category={item.category}
							size="sm"
							iconOnly
						/>
					)}
					{item.isFragile && (
						<ItemFragileBadge isFragile size="sm" iconOnly />
					)}
					{item.category && (
						<span className="text-[11px] text-muted-foreground capitalize leading-none">
							{item.category.toLowerCase().replace('_', ' ')}
						</span>
					)}
				</div>
			</div>
			{/* ── Weight badge ──────────────────────────────────────────────── */}
			{item.weight != null && (
				<ContainerMetricBadge
					value={item.weight * item.quantity}
					unit={
						WEIGHT_UNIT_META.find(
							(m) => m.value === item.weightUnit
						)?.symbol ?? 'kg'
					}
					size="sm"
					aria-label={`Total weight: ${item.weight * item.quantity} ${item.weightUnit}`}
				/>
			)}
			{/* ── Actions — visible on hover ────────────────────────────────── */}
			<div
				className={cn(
					'flex items-center gap-0.5 shrink-0',
					'opacity-0 group-hover:opacity-100',
					'transition-opacity duration-150'
				)}
			>
				<Tooltip>
					<TooltipTrigger
						render={
							<Button
								variant="ghost"
								size="icon"
								className="h-7 w-7 text-muted-foreground hover:text-foreground hover:bg-accent"
								onClick={() => onMove(item)}
								aria-label={`Move ${item.name} to another bag`}
							>
								<HugeiconsIcon
									icon={Move01Icon}
									className="h-3.5 w-3.5"
								/>
							</Button>
						}
					/>
					<TooltipContent side="top">
						<p>Move to another bag</p>
					</TooltipContent>
				</Tooltip>

				<Tooltip>
					<TooltipTrigger
						render={
							<Button
								variant="ghost"
								size="icon"
								className={cn(
									'h-7 w-7',
									'text-muted-foreground',
									'hover:text-destructive hover:bg-destructive/10',
									'transition-colors duration-150'
								)}
								onClick={() => onUnpack(item)}
								disabled={isUnpacking}
								aria-label={`Unpack ${item.name}`}
							>
								<HugeiconsIcon
									icon={Delete01Icon}
									className="h-3.5 w-3.5"
								/>
							</Button>
						}
					/>
					<TooltipContent side="top">
						<p>Remove from bag</p>
					</TooltipContent>
				</Tooltip>
			</div>
		</div>
	);
};

export default PackedItemRow;
