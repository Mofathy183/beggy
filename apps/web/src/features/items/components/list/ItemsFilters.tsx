'use client';

import { Separator } from '@shadcn-ui/separator';
import { Label } from '@shadcn-ui/label';

import {
	NumberRangeFilter,
	ToggleFilter,
	DateRangeFilter,
	ColorFilter,
	SearchInput,
} from '@shared-ui/filter';
import { Chips } from '@shared-ui/chips';
import { ListFilters } from '@shared-ui/list';

import { ITEM_CATEGORY_OPTIONS } from '@shared-ui/mappers';
import type { ItemFilterState } from '@shared/types';

// ─── Types ─────────────────────────────────────────────────────────────────────

type ItemsFiltersProps = {
	/** Current filter state — driven by the parent list hook */
	value: ItemFilterState;
	/** Triggered when filters are applied */
	onApply: (filters: ItemFilterState) => void;
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
const ItemsFilters = ({ value, onApply, onReset }: ItemsFiltersProps) => {
	return (
		<ListFilters<ItemFilterState>
			value={value}
			onApply={onApply}
			onReset={onReset}
		>
			{(draft, setDraft) => (
				<div className="flex flex-col gap-5">
					{/* ── Name ───────────────────────────────────────────────────── */}
					<SearchInput
						label="Name"
						placeholder="Search items…"
						value={draft.name ?? ''}
						commitOn="submit"
						onChange={(v) => setDraft({ ...draft, name: v })}
					/>

					{/* ── Color ──────────────────────────────────────────────────────── */}
					<ColorFilter
						label="Color"
						value={draft.color}
						onChange={(v) => setDraft({ ...draft, color: v })}
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
							value={draft.category ?? null}
							variant="primary"
							onChange={(v) =>
								setDraft({ ...draft, category: v ?? undefined })
							}
						/>
					</div>

					<Separator />

					{/* ── Fragile ────────────────────────────────────────────────────── */}
					<ToggleFilter
						label="Fragile"
						value={draft.isFragile}
						onChange={(v) => setDraft({ ...draft, isFragile: v })}
						showIcons
					/>

					<Separator />

					{/* ── Weight range ───────────────────────────────────────────────── */}
					<NumberRangeFilter
						label="Weight"
						entity="item"
						metric="weight"
						value={
							draft.weight
								? {
										min: draft.weight.min ?? undefined,
										max: draft.weight.max ?? undefined,
									}
								: undefined
						}
						onChange={(v) =>
							setDraft({
								...draft,
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
							draft.volume
								? {
										min: draft.volume.min ?? undefined,
										max: draft.volume.max ?? undefined,
									}
								: undefined
						}
						onChange={(v) =>
							setDraft({
								...draft,
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
							draft.createdAt
								? {
										from: draft.createdAt.from
											? new Date(draft.createdAt.from)
											: undefined,
										to: draft.createdAt.to
											? new Date(draft.createdAt.to)
											: undefined,
									}
								: undefined
						}
						onChange={(v) =>
							setDraft({
								...draft,
								createdAt: v
									? {
											// toISOString() gives "2026-04-03T22:00:00.000Z"
											// slice(0, 10) gives "2026-04-03" ← what your schema expects
											from: v.from
												? v.from
														.toISOString()
														.slice(0, 10)
												: undefined,
											to: v.to
												? v.to
														.toISOString()
														.slice(0, 10)
												: undefined,
										}
									: undefined,
							})
						}
					/>
				</div>
			)}
		</ListFilters>
	);
};

export default ItemsFilters;
