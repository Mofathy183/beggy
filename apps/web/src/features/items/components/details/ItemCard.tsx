import { Card, CardHeader, CardContent, CardFooter } from '@shadcn-ui/card';
import { Separator } from '@shadcn-ui/separator';
import { Tooltip, TooltipContent, TooltipTrigger } from '@shadcn-ui/tooltip';
import { HugeiconsIcon } from '@hugeicons/react';
import { cn } from '@shadcn-lib';

import {
	ITEM_CATEGORY_OPTIONS,
	WEIGHT_UNIT_META,
	VOLUME_UNIT_META,
} from '@shared-ui/mappers';
import ItemCategoryBadge from '@features/items/components/badges/ItemCategoryBadge';
import ItemFragileBadge from '@features/items/components/badges/ItemFragileBadge';
import ItemActions from '@features/items/components/actions/ItemActions';

import type { ItemDTO } from '@beggy/shared/types';

// ─── Types ─────────────────────────────────────────────────────────────────────

type ItemCardProps = {
	item: ItemDTO;
	/** Called when the user selects "Edit" from the action menu */
	onEdit: () => void;
	/** Called when the user selects "Delete" from the action menu */
	onDelete: () => void;
	/** Disables edit action while an update mutation is in-flight */
	isUpdating?: boolean;
	/** Disables delete action while a delete mutation is in-flight */
	isDeleting?: boolean;
	className?: string;
};

// ─── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Strips unnecessary trailing zeros from a fixed-decimal number.
 * 1.50 → "1.5", 1.00 → "1", 0.25 → "0.25"
 */
const formatMeasurement = (value: number, symbol: string): string => {
	const formatted = parseFloat(value.toFixed(2)).toString();
	return `${formatted} ${symbol}`;
};

// ─── Component ─────────────────────────────────────────────────────────────────

/**
 * ItemCard
 *
 * @description
 * Displays a single item's core information in a compact shadcn Card layout.
 *
 * Layout:
 * ┌─────────────────────────────────────────┐
 * │ CardHeader                              │
 * │  [icon container] [category badge]  [actions menu] │
 * ├─────────────────────────────────────────┤
 * │ CardContent                             │
 * │  Item name (h3)                         │
 * │  Color swatch + label (if present)      │
 * │  ─────────────────────────────────────  │
 * │  ⚖ weight  ·  ◻ volume                 │
 * ├─────────────────────────────────────────┤
 * │ CardFooter  (only when isFragile: true) │
 * │  [fragile badge]                        │
 * └─────────────────────────────────────────┘
 *
 * @remarks
 * - Unit symbols sourced from `WEIGHT_UNIT_META` / `VOLUME_UNIT_META`
 *   via `.find()` — single source of truth, no local label maps.
 * - Color swatch uses `style={{ backgroundColor }}` — the only acceptable
 *   inline style in this codebase. `item.color` is dynamic user data,
 *   not a semantic state. There is no token for arbitrary color strings.
 * - `CardFooter` only renders when `isFragile` is true to avoid phantom
 *   spacing from an empty footer element.
 */
const ItemCard = ({
	item,
	onEdit,
	onDelete,
	isUpdating = false,
	isDeleting = false,
	className,
}: ItemCardProps) => {
	// ── Derive unit symbols from mappers (single source of truth) ────────────

	const weightMeta = WEIGHT_UNIT_META.find(
		(m) => m.value === item.weightUnit
	);
	const volumeMeta = VOLUME_UNIT_META.find(
		(m) => m.value === item.volumeUnit
	);

	const weightLabel = weightMeta
		? formatMeasurement(item.weight, weightMeta.symbol)
		: `${item.weight} ${item.weightUnit}`;

	const volumeLabel = volumeMeta
		? formatMeasurement(item.volume, volumeMeta.symbol)
		: `${item.volume} ${item.volumeUnit}`;

	// ── Tooltip-friendly long labels for screen readers ───────────────────────

	const weightTooltip = weightMeta?.label ?? 'Weight';
	const volumeTooltip = volumeMeta?.label ?? 'Volume';

	// ── Category icon ─────────────────────────────────────────────────────────

	const categoryOption = ITEM_CATEGORY_OPTIONS.find(
		(o) => o.value === item.category
	);

	return (
		<Card
			className={cn(
				// Subtle hover: border tint + shadow lift.
				// Background stays bg-card — no bg-accent flash on grid cards.
				'hover:border-primary/30 hover:shadow-sm',
				'transition-[border-color,box-shadow] duration-200',
				className
			)}
			aria-label={`Item: ${item.name}`}
		>
			{/* ── Header: icon + category badge + action menu ─────────────── */}
			<CardHeader className="flex flex-row items-start justify-between gap-2 pb-2">
				<div className="flex items-center gap-2.5">
					{/* Category icon in accent tinted container */}
					{categoryOption?.icon && (
						<div className="bg-accent flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg">
							<HugeiconsIcon
								icon={categoryOption.icon}
								className="text-accent-foreground size-4"
								aria-hidden="true"
							/>
						</div>
					)}

					<ItemCategoryBadge
						category={item.category}
						iconOnly={false}
						size="sm"
					/>
				</div>

				<ItemActions
					item={item}
					onEdit={onEdit}
					onDelete={onDelete}
					isUpdating={isUpdating}
					isDeleting={isDeleting}
				/>
			</CardHeader>

			{/* ── Content: name + color + measurements ────────────────────── */}
			<CardContent className="flex flex-col gap-3 pb-3">
				{/* Item name */}
				<h3 className="text-card-foreground line-clamp-2 text-sm font-semibold leading-snug">
					{item.name}
				</h3>

				{/* Color swatch + label */}
				{item.color && (
					<div className="flex items-center gap-1.5">
						{/*
						 * Inline style: intentional and correct here.
						 * item.color is dynamic user-defined data ("navy", "olive", etc.)
						 * There is no semantic token for arbitrary color strings.
						 */}
						<span
							className="border-border h-3 w-3 flex-shrink-0 rounded-full border"
							style={{ backgroundColor: item.color }}
							aria-hidden="true"
						/>
						<span className="text-muted-foreground text-xs capitalize">
							{item.color}
						</span>
					</div>
				)}

				<Separator />

				{/* Measurements row — symbols from WEIGHT_UNIT_META / VOLUME_UNIT_META */}
				<div className="flex items-center gap-3">
					<Tooltip>
						<TooltipTrigger>
							<span
								className="text-muted-foreground cursor-default text-xs"
								aria-label={`${weightTooltip}: ${weightLabel}`}
							>
								⚖ {weightLabel}
							</span>
						</TooltipTrigger>
						<TooltipContent>
							<p>{weightTooltip}</p>
						</TooltipContent>
					</Tooltip>

					<span
						className="text-border select-none text-xs"
						aria-hidden="true"
					>
						·
					</span>

					<Tooltip>
						<TooltipTrigger>
							<span
								className="text-muted-foreground cursor-default text-xs"
								aria-label={`${volumeTooltip}: ${volumeLabel}`}
							>
								◻ {volumeLabel}
							</span>
						</TooltipTrigger>
						<TooltipContent>
							<p>{volumeTooltip}</p>
						</TooltipContent>
					</Tooltip>
				</div>
			</CardContent>

			{/* ── Footer: fragile badge (only when isFragile is true) ─────── */}
			{item.isFragile && (
				<CardFooter className="pt-0">
					<ItemFragileBadge isFragile={item.isFragile} size="sm" />
				</CardFooter>
			)}
		</Card>
	);
};

export default ItemCard;
