import { Card, CardHeader, CardContent, CardFooter } from '@shadcn-ui/card';
import { Tooltip, TooltipContent, TooltipTrigger } from '@shadcn-ui/tooltip';
import { HugeiconsIcon } from '@hugeicons/react';
import {
	WeightScale01Icon,
	CubeIcon,
	PaintBucketIcon,
} from '@hugeicons/core-free-icons';
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
	onEdit: () => void;
	onDelete: () => void;
	isUpdating?: boolean;
	isDeleting?: boolean;
	className?: string;
};

// ─── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Strips trailing zeros: 1.50 → "1.5", 1.00 → "1"
 */
const fmt = (value: number): string => parseFloat(value.toFixed(2)).toString();

// ─── Sub-components ────────────────────────────────────────────────────────────

/**
 * A single measurement pill: icon + value + unit symbol.
 * Uses a subtle muted container to give the measurements
 * visual weight without competing with the name or badges.
 */
const MeasurementPill = ({
	icon,
	value,
	symbol,
	tooltip,
}: {
	icon: React.ComponentProps<typeof HugeiconsIcon>['icon'];
	value: string;
	symbol: string;
	tooltip: string;
}) => (
	<Tooltip>
		<TooltipTrigger>
			<div
				className={cn(
					'flex items-center gap-1.5',
					'bg-muted rounded-md px-2.5 py-1.5',
					'cursor-default select-none'
				)}
				aria-label={`${tooltip}: ${value} ${symbol}`}
			>
				<HugeiconsIcon
					icon={icon}
					className="text-muted-foreground size-3.5 flex-shrink-0"
					aria-hidden="true"
				/>
				<span className="text-foreground text-xs font-medium tabular-nums">
					{value}
				</span>
				<span className="text-muted-foreground text-xs">{symbol}</span>
			</div>
		</TooltipTrigger>
		<TooltipContent side="bottom">
			<p>{tooltip}</p>
		</TooltipContent>
	</Tooltip>
);

// ─── Component ─────────────────────────────────────────────────────────────────

/**
 * ItemCard
 *
 * @description
 * Displays a single item in a compact, visually structured shadcn Card.
 *
 * Layout:
 * ┌──────────────────────────────────────────────┐
 * │ CardHeader                                   │
 * │  [icon bg] [category badge]    [actions ···] │
 * ├──────────────────────────────────────────────┤
 * │ CardContent                                  │
 * │  Item Name  (h3, clamp 2 lines)              │
 * │                                              │
 * │  ● color label     (if present)              │
 * │                                              │
 * │  [⚖ 0.2 kg]  [📦 0.3 L]   measurement pills │
 * ├──────────────────────────────────────────────┤
 * │ CardFooter  (only when isFragile)            │
 * │  [⚠ Fragile]                                │
 * └──────────────────────────────────────────────┘
 *
 * @remarks
 * - Measurement pills use `WeightScaleIcon` and `Package01Icon` from
 *   Hugeicons — not Unicode characters.
 * - Unit symbols sourced from `WEIGHT_UNIT_META` / `VOLUME_UNIT_META`.
 * - Color swatch uses `style={{ backgroundColor }}` — the only acceptable
 *   inline style. `item.color` is user-defined data, not a semantic state.
 * - `CardFooter` only mounts when `isFragile` is true to prevent phantom
 *   padding on non-fragile cards in the grid.
 */
const ItemCard = ({
	item,
	onEdit,
	onDelete,
	isUpdating = false,
	isDeleting = false,
	className,
}: ItemCardProps) => {
	const categoryOption = ITEM_CATEGORY_OPTIONS.find(
		(o) => o.value === item.category
	);

	const weightMeta = WEIGHT_UNIT_META.find(
		(m) => m.value === item.weightUnit
	);
	const volumeMeta = VOLUME_UNIT_META.find(
		(m) => m.value === item.volumeUnit
	);

	return (
		<Card
			className={cn(
				'hover:border-primary/30 hover:shadow-sm',
				'transition-[border-color,box-shadow] duration-200',
				className
			)}
			aria-label={`Item: ${item.name}`}
		>
			{/* ── Header ─────────────────────────────────────────────────────── */}
			<CardHeader className="flex flex-row items-center justify-between gap-2 pb-3">
				<div className="flex items-center gap-2">
					{/* Category icon in accent container */}
					{categoryOption?.icon && (
						<div className="bg-accent flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg">
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

			{/* ── Content ────────────────────────────────────────────────────── */}
			<CardContent className="flex flex-col gap-3">
				{/* Name — primary text, clamp at 2 lines */}
				<h3 className="text-card-foreground line-clamp-2 text-sm font-semibold leading-snug">
					{item.name}
				</h3>

				{/* Color — swatch dot + label */}
				{item.color && (
					<div className="flex items-center gap-1.5">
						<HugeiconsIcon
							icon={PaintBucketIcon}
							className="text-muted-foreground size-3 flex-shrink-0"
							aria-hidden="true"
						/>
						{/*
						 * Inline style: intentional and correct here.
						 * item.color is dynamic user-defined data.
						 * No semantic token exists for arbitrary color strings.
						 */}
						<span
							className="border-border/60 h-2.5 w-2.5 flex-shrink-0 rounded-full border"
							style={{ backgroundColor: item.color }}
							aria-hidden="true"
						/>
						<span className="text-muted-foreground text-xs capitalize">
							{item.color}
						</span>
					</div>
				)}

				{/* Measurements — weight + volume as structured pills */}
				<div className="flex items-center gap-2">
					<MeasurementPill
						icon={WeightScale01Icon}
						value={fmt(item.weight)}
						symbol={weightMeta?.symbol ?? item.weightUnit}
						tooltip={weightMeta?.label ?? 'Weight'}
					/>
					<MeasurementPill
						icon={CubeIcon}
						value={fmt(item.volume)}
						symbol={volumeMeta?.symbol ?? item.volumeUnit}
						tooltip={volumeMeta?.label ?? 'Volume'}
					/>
				</div>
			</CardContent>

			{/* ── Footer: fragile badge ───────────────────────────────────────── */}
			{item.isFragile && (
				<CardFooter className="pt-0">
					<ItemFragileBadge isFragile={item.isFragile} size="sm" />
				</CardFooter>
			)}
		</Card>
	);
};

export default ItemCard;
