'use client';

import { DataGrid } from '@shared-ui/grid';
import { Card } from '@shadcn-ui/card';
import { Skeleton } from '@shadcn-ui/skeleton';

import BagCard from '@features/bags/components/details/BagCard';
import BagsEmptyState from '@features/bags/components/list/BagsEmptyState';

import type { BagDTO } from '@beggy/shared/types';

// ─── Skeleton ──────────────────────────────────────────────────────────────────

/**
 * BagCardSkeleton
 *
 * Mirrors the anatomy of `BagCard` so layout doesn't shift on load:
 * - Header row (name + action menu placeholder)
 * - Type badge + indicators
 * - Stats row (weight + capacity)
 * - Footer date
 *
 * @remarks
 * Not exported — internal to this file. The loading state is managed
 * by `BagsGrid` via the `isLoading` prop.
 */
const BagCardSkeleton = () => (
	<Card className="flex flex-col gap-3 p-4">
		{/* Header — name + action button */}
		<div className="flex items-start justify-between gap-2">
			<Skeleton className="h-4 w-2/3 rounded" />
			<Skeleton className="h-7 w-7 rounded-md" />
		</div>

		{/* Type + indicator badges */}
		<div className="flex gap-1.5">
			<Skeleton className="h-5 w-20 rounded-full" />
			<Skeleton className="h-5 w-16 rounded-full" />
		</div>

		<Skeleton className="h-px w-full" />

		{/* Stats — max weight + max capacity */}
		<div className="grid grid-cols-2 gap-3">
			<div className="flex flex-col gap-1">
				<Skeleton className="h-3 w-16 rounded" />
				<Skeleton className="h-4 w-12 rounded" />
			</div>
			<div className="flex flex-col gap-1">
				<Skeleton className="h-3 w-16 rounded" />
				<Skeleton className="h-4 w-12 rounded" />
			</div>
		</div>

		<Skeleton className="h-px w-full" />

		{/* Container status panel — compact variant skeleton */}
		{/* Mirrors ContainerStatusPanelSkeleton compact layout */}
		<div className="flex flex-col gap-2.5">
			{[0, 1].map((i) => (
				<div key={i} className="flex flex-col gap-1.5">
					<div className="flex items-center justify-between">
						<Skeleton className="h-3 w-12" />
						<Skeleton className="h-3 w-20" />
					</div>
					<Skeleton className="h-1.5 w-full rounded-full" />
				</div>
			))}
		</div>

		<Skeleton className="h-px w-full" />

		{/* Footer — date added */}
		<Skeleton className="h-3 w-24 rounded" />
	</Card>
);

// ─── Types ─────────────────────────────────────────────────────────────────────

type BagsGridProps = {
	/** Bags to display. */
	bags: BagDTO[];

	/** Shows skeleton placeholders while fetching. */
	isLoading?: boolean;

	/**
	 * Whether any filters are currently active.
	 * Passed to `BagsEmptyState` to switch between the
	 * "no bags" and "no results" empty-state variants.
	 */
	hasFilters?: boolean;

	/** Called from `BagsEmptyState` → "Clear filters" CTA */
	onResetFilters: () => void;

	/** Called when the user triggers edit on a card */
	onEdit: (bag: BagDTO) => void;

	/** Called when the user triggers delete on a card */
	onDelete: (bag: BagDTO) => void;

	/**
	 * The id of the bag currently being updated.
	 * The matching card will show its loading state.
	 */
	updatingId?: string | null;

	/**
	 * The id of the bag currently being deleted.
	 * The matching card will be dimmed and non-interactive.
	 */
	deletingId?: string | null;
};

// ─── Component ─────────────────────────────────────────────────────────────────

/**
 * BagsGrid
 *
 * @description
 * Responsive grid of `BagCard` components for the Bags list.
 *
 * @remarks
 * Responsibilities:
 * - Renders skeletons while `isLoading` is true (prevents layout shift)
 * - Delegates to `DataGrid` for responsive CSS grid layout
 * - Delegates to `BagsEmptyState` when no bags are present
 * - Passes through action handlers + mutation state to each `BagCard`
 *
 * The skeleton count (8) matches a typical first-page result set.
 * It keeps the grid height stable so the rest of the page doesn't jump.
 *
 * @example
 * ```tsx
 * <BagsGrid
 *   bags={bags}
 *   isLoading={isLoading}
 *   hasFilters={hasActiveFilters}
 *   onResetFilters={handleReset}
 *   onEdit={(b) => setEditTarget(b)}
 *   onDelete={(b) => handleDelete(b.id)}
 *   deletingId={deletingId}
 * />
 * ```
 */
const BagsGrid = ({
	bags,
	isLoading = false,
	hasFilters = false,
	onResetFilters,
	onEdit,
	onDelete,
	updatingId,
	deletingId,
}: BagsGridProps) => {
	// ── Loading state — render fixed number of skeletons ─────────────────────
	if (isLoading) {
		return (
			<DataGrid isLoading>
				{Array.from({ length: 8 }, (_, i) => (
					<BagCardSkeleton key={i} />
				))}
			</DataGrid>
		);
	}

	return (
		<DataGrid
			empty={
				<BagsEmptyState
					hasFilters={hasFilters}
					onReset={onResetFilters}
				/>
			}
		>
			{bags.map((bag) => (
				<BagCard
					key={bag.id}
					bag={bag}
					onEdit={onEdit}
					onDelete={onDelete}
					isUpdating={updatingId === bag.id}
					isDeleting={deletingId === bag.id}
				/>
			))}
		</DataGrid>
	);
};

export default BagsGrid;
