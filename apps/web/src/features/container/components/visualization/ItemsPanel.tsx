'use client';

import { useState, useCallback } from 'react';
import { useDraggable } from '@dnd-kit/react';

import { Skeleton } from '@shadcn-ui/skeleton';

import ItemCard from '@features/items/components/details/ItemCard';
import SearchInput from '@shared-ui/filter/SearchInput';
import { useItemsList } from '@features/items/hooks';

import type { ItemDTO } from '@beggy/shared/types';
import { cn } from '@shadcn-lib';

// ─── Draggable item card ───────────────────────────────────────────────────────

type DraggableItemCardProps = {
	item: ItemDTO;
};

/**
 * Draggable wrapper for `ItemCard` used in the packing flow.
 *
 * @remarks
 * - Entire card acts as the drag handle ("pick and place" UX)
 * - Emits drag metadata consumed by the container drop zone
 * - Visual feedback is delegated to DragOverlay (source card dims)
 */
const DraggableItemCard = ({ item }: DraggableItemCardProps) => {
	// Stable no-op callbacks — ItemCard requires these props but packing
	// panel has no edit/delete flow. useCallback avoids re-render churn.
	const noop = useCallback(() => {}, []);

	const { ref, isDragging } = useDraggable({
		id: `library-${item.id}`,
		data: {
			type: 'library-item',
			itemId: item.id,
			item,
		},
	});

	return (
		<div
			ref={ref}
			className={cn(
				// Drag interaction
				'cursor-grab active:cursor-grabbing touch-none select-none',
				// Lift-away feedback while dragging
				// (ghost is shown by DragOverlay in ContainerDetailPage)
				isDragging && 'opacity-40 scale-[0.98]',
				// Smooth transition for the scale + opacity
				'transition-[opacity,transform] duration-150'
			)}
			aria-label={`${item.name} — drag to pack into bag`}
			aria-roledescription="Draggable item"
			role="button"
			tabIndex={0}
			onKeyDown={(e) => {
				if (e.key === ' ' || e.key === 'Enter') e.preventDefault();
			}}
		>
			<ItemCard
				item={item}
				onEdit={noop}
				onDelete={noop}
				isUpdating={false}
				isDeleting={false}
				// Subtle ring on hover to reinforce interactivity without
				// competing with the drag cursor signal.
				className="hover:ring-1 hover:ring-primary/20"
			/>
		</div>
	);
};

// ─── Panel ─────────────────────────────────────────────────────────────────────

type ItemsPanelProps = {
	/**
	 * The container this panel belongs to.
	 *
	 * Currently unused in the query — items are fetched from the full
	 * user library. Kept as a prop for future server-side filtering
	 * (e.g. exclude already-packed items from this specific container).
	 */
	containerId: string;
};

/**
 * Item library panel used in the packing workspace.
 *
 * @remarks
 * - Fetches a paginated item list via `useItemsList`
 * - Applies client-side search filtering
 * - Exposes draggable items for packing interactions
 *
 * Data strategy:
 * - Single fetch per mount
 * - Client-side filtering for responsive UX
 *
 * Drag contract:
 * - Emits `data.type = 'library-item'`
 * - Consumers (drop zones) must handle this shape
 */
const ItemsPanel = ({ containerId: _containerId }: ItemsPanelProps) => {
	// Local search state — client-side filter on top of the fetched page.
	// SearchInput debounces internally (400 ms), so no debounce needed here.
	const [search, setSearch] = useState<string | undefined>(undefined);

	// useItemsList wires useListQuery → useGetItemsQuery with domain defaults:
	//   - initialOrderBy: CREATED_AT DESC (newest first)
	//   - initialPagination: { page: 1, limit: 12 }
	const { data: items, isLoading } = useItemsList();

	// Client-side search filter on top of the fetched page.
	const filtered =
		search && search.trim()
			? items.filter((item) =>
					item.name.toLowerCase().includes(search.toLowerCase())
				)
			: items;

	return (
		<div className="flex flex-col gap-4 mt-4 h-full overflow-hidden">
			{/* ── Search ──────────────────────────────────────────────── */}
			{/*
			 * SearchInput handles debounce internally (400 ms default).
			 * It emits `undefined` when the field is cleared, which resets
			 * the filter to show all items — no extra reset logic needed here.
			 */}
			<SearchInput
				label="Search items"
				value={search}
				onChange={setSearch}
				placeholder="Search items…"
			/>

			{/* ── Item cards ──────────────────────────────────────────── */}
			<div
				className="flex flex-col gap-3 overflow-y-auto flex-1 pb-4"
				role="list"
				aria-label="Your items — drag to pack"
			>
				{/* Loading skeletons — match ItemCard approximate height */}
				{isLoading &&
					Array.from({ length: 5 }).map((_, i) => (
						<Skeleton key={i} className="h-36 w-full rounded-xl" />
					))}

				{/* Empty / no-match state */}
				{!isLoading && filtered.length === 0 && (
					<p className="text-muted-foreground text-sm text-center py-8">
						{search
							? 'Nothing matches that search — try a different name.'
							: "You haven't added any items yet."}
					</p>
				)}

				{/* Draggable ItemCard instances */}
				{!isLoading &&
					filtered.map((item) => (
						<div key={item.id} role="listitem">
							<DraggableItemCard item={item} />
						</div>
					))}
			</div>

			{/* ── Drag hint ───────────────────────────────────────────── */}
			<p
				className="shrink-0 text-muted-foreground text-xs text-center pb-2"
				aria-live="polite"
			>
				Drag any item onto the bag to pack it
			</p>
		</div>
	);
};

export default ItemsPanel;
