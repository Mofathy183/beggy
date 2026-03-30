'use client';

import { Separator } from '@shadcn-ui/separator';
import { Label } from '@shadcn-ui/label';

import {
	NumberRangeFilter,
	DateRangeFilter,
	SearchInput,
	ColorFilter,
} from '@shared-ui/filter';
import { Chips } from '@shared-ui/chips';
import { ListFilters } from '@shared-ui/list';

import {
	BAG_TYPE_OPTIONS,
	SIZE_OPTIONS,
	MATERIAL_OPTIONS,
	// BAG_FEATURE_OPTIONS,
} from '@shared/ui/mappers';
import type { BagFilterInput } from '@beggy/shared/types';

// ─── Types ─────────────────────────────────────────────────────────────────────

type BagsFiltersProps = {
	/** Current filter state — driven by the parent list hook */
	value: BagFilterInput;
	/** Triggered when filters are applied */
	onApply: (filters: BagFilterInput) => void;
	/** Called with the complete updated filter object on any change */
	onChange: (filters: BagFilterInput) => void;
	/** Called when the user clears all filters */
	onReset: () => void;
};

// ─── Component ─────────────────────────────────────────────────────────────────

/**
 * BagsFilters
 *
 * @description
 * Filter panel for the Bags list. Covers every field in `bagFilter`
 * from `QuerySchema` so the UI and the backend schema stay in sync.
 *
 * @remarks
 * Delegates the filter shell (apply/reset, open/close, active indicator)
 * to the shared `ListFilters` primitive. Domain-specific controls:
 *
 * ┌─────────────────────────────────────────────────────────────────┐
 * │ Field         │ Control              │ Notes                    │
 * ├─────────────────────────────────────────────────────────────────┤
 * │ name          │ SearchInput          │ free-text contains       │
 * │ color         │ ColorFilter          │ free-text + quick swatches│
 * │ type          │ Chips (single)       │ BagType enum             │
 * │ size          │ Chips (single)       │ Size enum                │
 * │ material      │ Chips (single)       │ Material enum            │
 * │ features      │ Chips (multi)        │ BagFeature[] — hasSome   │
 * │ maxWeight     │ NumberRangeFilter    │ entity: bag, metric: weight│
 * │ maxCapacity   │ NumberRangeFilter    │ entity: bag, metric: capacity│
 * │ createdAt     │ DateRangeFilter      │ from / to                │
 * └─────────────────────────────────────────────────────────────────┘
 *
 * No local state — purely controlled via `value` / `onChange` / `onApply`.
 *
 * Schema alignment:
 * Every field here maps directly to a field in `QuerySchema.bagFilter`.
 * Do not add UI fields that aren't in the schema — they'll be silently
 * ignored by the backend. If you need a new filter, add it to the schema
 * first (`bagFilter` in `api.schema.ts` + `BagFilterInput` type), then
 * add the control here.
 */
const BagsFilters = ({
	value,
	onApply,
	onChange,
	onReset,
}: BagsFiltersProps) => {
	return (
		<ListFilters<BagFilterInput>
			value={value}
			onApply={onApply}
			onReset={onReset}
		>
			<div className="flex flex-col gap-5">
				{/* ── Name ───────────────────────────────────────────────────── */}
				{/*
				 * Maps to: Prisma `name: { contains: value, mode: 'insensitive' }`
				 * Schema:  `name: z.string()` in bagFilter (add if not present)
				 */}
				<SearchInput
					label="Name"
					placeholder="Search bags…"
					value={value.name ?? ''}
					onChange={(v) => onChange({ ...value, name: v })}
				/>

				<Separator />

				{/* ── Color ──────────────────────────────────────────────────── */}
				{/*
				 * Maps to: Prisma `color: { contains: value, mode: 'insensitive' }`
				 * Schema:  `color: z.string()` — already in bagFilter
				 * Same pattern as ItemsFilters.
				 */}
				<ColorFilter
					label="Color"
					value={value.color}
					onChange={(v) => onChange({ ...value, color: v })}
				/>

				<Separator />

				{/* ── Type ───────────────────────────────────────────────────── */}
				{/*
				 * Maps to: Prisma `type: value`
				 * Schema:  `type: FieldsSchema.enum(BagType, false)` — in bagFilter
				 * Single-select: only one type at a time makes sense for a bag.
				 * Chips single mode emits `T | null` — null → undefined.
				 */}
				<div className="flex flex-col gap-1.5">
					<Label className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
						Type
					</Label>
					<Chips
						mode="single"
						options={BAG_TYPE_OPTIONS}
						value={value.type ?? null}
						variant="primary"
						onChange={(v) =>
							onChange({ ...value, type: v ?? undefined })
						}
					/>
				</div>

				<Separator />

				{/* ── Size ───────────────────────────────────────────────────── */}
				{/*
				 * Maps to: Prisma `size: value`
				 * Schema:  `size: FieldsSchema.enum(Size, false)` — in bagFilter
				 * Single-select: a bag has exactly one size.
				 */}
				<div className="flex flex-col gap-1.5">
					<Label className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
						Size
					</Label>
					<Chips
						mode="single"
						options={SIZE_OPTIONS}
						value={value.size ?? null}
						variant="primary"
						onChange={(v) =>
							onChange({ ...value, size: v ?? undefined })
						}
					/>
				</div>

				<Separator />

				{/* ── Material ───────────────────────────────────────────────── */}
				{/*
				 * Maps to: Prisma `material: value`
				 * Schema:  `material: FieldsSchema.enum(Material, false)` — in bagFilter
				 * Single-select: a bag is made of one primary material.
				 */}
				<div className="flex flex-col gap-1.5">
					<Label className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
						Material
					</Label>
					<Chips
						mode="single"
						options={MATERIAL_OPTIONS}
						value={value.material ?? null}
						variant="accent"
						onChange={(v) =>
							onChange({ ...value, material: v ?? undefined })
						}
					/>
				</div>

				<Separator />

				{/* ── Features ───────────────────────────────────────────────── */}
				{/*
				 * Maps to: Prisma `features: { hasSome: value }`
				 * Schema:  add `features: FieldsSchema.array(FieldsSchema.enum(BagFeature, true), false)`
				 *          to bagFilter in QuerySchema.
				 *
				 * Multi-select: a bag can have multiple features simultaneously.
				 * Chips multi mode — value is BagFeature[].
				 * Empty selection normalised to undefined (no filter sent).
				 *
				 * UX note: `maxSelected` is not constrained here — the user may
				 * want to find bags that have ANY of several features at once.
				 * The backend `hasSome` semantics support this naturally.
				 */}
				{/* <div className="flex flex-col gap-1.5">
					<Label className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
						Features
					</Label>
					<Chips
						mode="multiple"
						options={BAG_FEATURE_OPTIONS}
						value={value.features ?? []}
						variant="accent"
						onChange={(v) =>
							onChange({
								...value,
								features: v.length > 0 ? v : undefined,
							})
						}
					/>
				</div> */}

				<Separator />

				{/* ── Max weight range ───────────────────────────────────────── */}
				{/*
				 * Maps to: Prisma `maxWeight: { gte: min, lte: max }`
				 * Schema:  `maxWeight: numberRangeSchema('bag', 'weight')` — in bagFilter
				 */}
				<NumberRangeFilter
					label="Max weight"
					entity="bag"
					metric="weight"
					value={
						value.maxWeight
							? {
									min: value.maxWeight.min ?? undefined,
									max: value.maxWeight.max ?? undefined,
								}
							: undefined
					}
					onChange={(v) =>
						onChange({
							...value,
							maxWeight: v
								? {
										min: v.min ?? undefined,
										max: v.max ?? undefined,
									}
								: undefined,
						})
					}
				/>

				<Separator />

				{/* ── Max capacity range ─────────────────────────────────────── */}
				{/*
				 * Maps to: Prisma `maxCapacity: { gte: min, lte: max }`
				 * Schema:  `maxCapacity: numberRangeSchema('bag', 'capacity')` — in bagFilter
				 */}
				<NumberRangeFilter
					label="Max capacity"
					entity="bag"
					metric="capacity"
					value={
						value.maxCapacity
							? {
									min: value.maxCapacity.min ?? undefined,
									max: value.maxCapacity.max ?? undefined,
								}
							: undefined
					}
					onChange={(v) =>
						onChange({
							...value,
							maxCapacity: v
								? {
										min: v.min ?? undefined,
										max: v.max ?? undefined,
									}
								: undefined,
						})
					}
				/>

				<Separator />

				{/* ── Date added ─────────────────────────────────────────────── */}
				{/*
				 * Maps to: Prisma `createdAt: { gte: from, lte: to }`
				 * Schema:  `createdAt: dateRangeSchema` — already in bagFilter
				 */}
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

export default BagsFilters;
