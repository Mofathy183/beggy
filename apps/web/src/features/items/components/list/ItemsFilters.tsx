'use client';

import { Separator } from '@shadcn-ui/separator';
import { Label } from '@shadcn-ui/label';

import {
	NumberRangeFilter,
	ToggleFilter,
	DateRangeFilter,
	ColorFilter,
} from '@shared-ui/filter';
import { Chips } from '@shared-ui/chips';
import { ListFilters } from '@shared-ui/list';

import { ITEM_CATEGORY_OPTIONS } from '@shared-ui/mappers';
import type { ItemFilterInput } from '@beggy/shared/types';

// ─── Types ─────────────────────────────────────────────────────────────────────

type ItemsFiltersProps = {
	/** Current filter state — driven by the parent list hook */
	value: ItemFilterInput;
	/** Triggered when filters are applied */
	onApply: (filters: ItemFilterInput) => void;
	/** Called with the complete updated filter object on any change */
	onChange: (filters: ItemFilterInput) => void;
	/** Called when the user clears all filters */
	onReset: () => void;
};

// ─── Component ─────────────────────────────────────────────────────────────────

/**
 * Filter panel for the Items list.
 *
 * @remarks
 * Delegates the filter shell (apply/reset controls, open/close, active
 * indicator) to the shared `ListFilters` primitive, and composes
 * domain-specific filter controls inside it:
 *
 * - `ColorFilter`       — color free-text + quick swatches
 * - `Chips`             — category single-select from `ITEM_CATEGORY_OPTIONS`
 * - `ToggleFilter`      — tri-state boolean for `isFragile`
 * - `NumberRangeFilter` — weight range  (entity: 'item', metric: 'weight')
 * - `NumberRangeFilter` — volume range  (entity: 'item', metric: 'volume')
 * - `DateRangeFilter`   — `createdAt` date range
 *
 * No local state — purely controlled via `value` / `onChange` / `onApply`.
 */
const ItemsFilters = ({
	value,
	onApply,
	onChange,
	onReset,
}: ItemsFiltersProps) => {
	return (
		<ListFilters<ItemFilterInput>
			value={value}
			onApply={onApply}
			onReset={onReset}
		>
			<div className="flex flex-col gap-5">
				{/* ── Color ──────────────────────────────────────────────────────── */}
				<ColorFilter
					label="Color"
					value={value.color}
					onChange={(v) => onChange({ ...value, color: v })}
				/>

				<Separator />

				{/* ── Category ───────────────────────────────────────────────────── */}
				<div className="flex flex-col gap-1.5">
					<Label className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
						Category
					</Label>
					{/*
					 * Single-select: `filters.category` is `ItemCategory | undefined`.
					 * Chips single mode emits `T | null` — null maps to undefined
					 * at the update call site.
					 * Icons and labels come from ITEM_CATEGORY_OPTIONS — no local
					 * label map needed.
					 */}
					<Chips
						mode="single"
						options={ITEM_CATEGORY_OPTIONS}
						value={value.category ?? null}
						variant="accent"
						onChange={(v) =>
							onChange({ ...value, category: v ?? undefined })
						}
					/>
				</div>

				<Separator />

				{/* ── Fragile ────────────────────────────────────────────────────── */}
				<ToggleFilter
					label="Fragile"
					value={value.isFragile}
					onChange={(v) => onChange({ ...value, isFragile: v })}
					showIcons
				/>

				<Separator />

				{/* ── Weight range ───────────────────────────────────────────────── */}
				<NumberRangeFilter
					label="Weight"
					entity="item"
					metric="weight"
					value={
						value.weight
							? {
									min: value.weight.min ?? undefined,
									max: value.weight.max ?? undefined,
								}
							: undefined
					}
					onChange={(v) =>
						onChange({
							...value,
							weight: v
								? {
										min: v.min ?? undefined,
										max: v.max ?? undefined,
									}
								: undefined,
						})
					}
				/>

				<Separator />

				{/* ── Volume range ───────────────────────────────────────────────── */}
				<NumberRangeFilter
					label="Volume"
					entity="item"
					metric="volume"
					value={
						value.volume
							? {
									min: value.volume.min ?? undefined,
									max: value.volume.max ?? undefined,
								}
							: undefined
					}
					onChange={(v) =>
						onChange({
							...value,
							volume: v
								? {
										min: v.min ?? undefined,
										max: v.max ?? undefined,
									}
								: undefined,
						})
					}
				/>

				<Separator />

				{/* ── Date added ─────────────────────────────────────────────────── */}
				<DateRangeFilter
					label="Date added"
					value={
						value.createdAt
							? {
									from: value.createdAt.from ?? undefined,
									to: value.createdAt.to ?? undefined,
								}
							: undefined
					}
					onChange={(v) =>
						onChange({
							...value,
							createdAt: v
								? {
										from: v.from ?? undefined,
										to: v.to ?? undefined,
									}
								: undefined,
						})
					}
				/>
			</div>
		</ListFilters>
	);
};

export default ItemsFilters;
