// import { Skeleton } from '@shadcn-ui/skeleton';
// import { DataGrid } from '@shared-ui/grid';

// import ItemCard from '@features/items/components/details/ItemCard';
// import ItemsEmptyState from './ItemsEmptyState';

// import type { ItemDTO } from '@beggy/shared/types';

// // ─── Types ─────────────────────────────────────────────────────────────────────

// type ItemsGridProps = {
// 	items: ItemDTO[];

// 	/** Whether the initial load is in progress — shows skeleton grid */
// 	isLoading: boolean;

// 	/** Whether filters are active — passed to empty state for copy variant */
// 	hasFilters?: boolean;

// 	/** Called by the empty state "Clear filters" CTA */
// 	onReset: () => void;

// 	/** Called when the user selects "Edit" from an item's action menu */
// 	onEdit: (item: ItemDTO) => void;

// 	/** Called when the user selects "Delete" from an item's action menu */
// 	onDelete: (item: ItemDTO) => void;

// 	/** Additional class names passed to DataGrid */
// 	className?: string;
// };

// // ─── Skeleton ──────────────────────────────────────────────────────────────────

// /**
//  * Skeleton placeholder that mirrors the visual structure of `ItemCard`.
//  * Keeps layout shift minimal during initial load.
//  */
// const ItemCardSkeleton = () => (
// 	<div className="bg-card border-border flex flex-col gap-3 rounded-xl border p-4">
// 		{/* Header: icon placeholder + category badge */}
// 		<div className="flex items-start justify-between">
// 			<Skeleton className="h-10 w-10 rounded-lg" />
// 			<Skeleton className="h-5 w-20 rounded-full" />
// 		</div>

// 		{/* Item name */}
// 		<Skeleton className="h-4 w-3/4 rounded" />

// 		{/* Measurement row: weight + volume */}
// 		<div className="flex gap-2">
// 			<Skeleton className="h-3 w-16 rounded" />
// 			<Skeleton className="h-3 w-16 rounded" />
// 		</div>

// 		{/* Footer: fragile badge + action menu */}
// 		<div className="mt-1 flex items-center justify-between">
// 			<Skeleton className="h-5 w-14 rounded-full" />
// 			<Skeleton className="h-8 w-8 rounded-md" />
// 		</div>
// 	</div>
// );

// /**
//  * Matches `initialPagination.limit` in `useItemsList`.
//  * Fills exactly one full page with skeletons during initial load.
//  */
// const SKELETON_COUNT = 12;

// // ─── Component ─────────────────────────────────────────────────────────────────

// /**
//  * Items grid — primary list display for the Items feature.
//  *
//  * @remarks
//  * - Initial load: renders a full skeleton grid.
//  * - Empty: delegates to `ItemsEmptyState` via `DataGrid`'s `empty` prop.
//  * - Populated: responsive card grid, one `ItemCard` per item.
//  *
//  * Background refetch state (filter/page change) is handled by `DataGrid`
//  * internally — no `isFetching` dim logic needed here.
//  */
// const ItemsGrid = ({
// 	items,
// 	isLoading = false,
// 	hasFilters = false,
// 	onReset,
// 	onEdit,
// 	onDelete,
// 	className,
// }: ItemsGridProps) => {
// 	// ── Initial load — skeleton grid ─────────────────────────────────────────
// 	if (isLoading) {
// 		return (
// 			<DataGrid>
// 				{Array.from({ length: SKELETON_COUNT }).map((_, i) => (
// 					<ItemCardSkeleton key={i} />
// 				))}
// 			</DataGrid>
// 		);
// 	}

// 	// ── Populated / empty ────────────────────────────────────────────────────
// 	return (
// 		<DataGrid
// 			aria-busy={isLoading}
// 			isLoading={isLoading}
// 			className={className}
// 			empty={
// 				<ItemsEmptyState hasFilters={hasFilters} onReset={onReset} />
// 			}
// 		>
// 			{items.map((item) => (
// 				<div key={item.id} role="listitem">
// 					<ItemCard
// 						item={item}
// 						onEdit={() => onEdit(item)}
// 						onDelete={() => onDelete(item)}
// 					/>
// 				</div>
// 			))}
// 		</DataGrid>
// 	);
// };

// export default ItemsGrid;
