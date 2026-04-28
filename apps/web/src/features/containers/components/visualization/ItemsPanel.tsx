'use client';

import { useState, useCallback, useEffect, useRef, useReducer } from 'react';
import { useDraggable } from '@dnd-kit/react';

import { Skeleton } from '@shadcn-ui/skeleton';
import { Button } from '@shadcn-ui/button';
import { HugeiconsIcon } from '@hugeicons/react';
import { ArrowDown01Icon, Package01Icon } from '@hugeicons/core-free-icons';

import ItemCard from '@features/items/components/details/ItemCard';
import SearchInput from '@shared-ui/filter/SearchInput';
import { useItemsList } from '@features/items/hooks';

import type { ItemDTO } from '@beggy/shared/types';
import { cn } from '@shadcn-lib';

// ─── Draggable item card ───────────────────────────────────────────────────────

type DraggableItemCardProps = {
	item: ItemDTO;
	isNew?: boolean;
};

/**
 * Draggable wrapper for `ItemCard` used in the packing flow.
 *
 * @remarks
 * - Entire card acts as the drag handle ("pick and place" UX)
 * - Emits drag metadata consumed by the container drop zone
 * - Visual feedback is delegated to DragOverlay (source card dims)
 */
const DraggableItemCard = ({ item, isNew = false }: DraggableItemCardProps) => {
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
				'transition-[opacity,transform] duration-150',
				// Fade-in for newly loaded cards (page 2+)
				isNew &&
					'animate-in fade-in slide-in-from-bottom-2 duration-300'
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
				onSelect={noop}
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

// ─── Accumulator reducer ───────────────────────────────────────────────────────

/**
 * Owns all multi-page accumulation state in one place.
 *
 * @remarks
 * RTK Query replaces `data` per-page rather than appending, so we
 * accumulate here. Using a reducer (instead of multiple useState calls)
 * means the effect only dispatches — it never calls setState directly,
 * which satisfies the react-hooks/set-state-in-effect rule.
 */
type AccumulatorState = {
	/** All items loaded so far across pages. */
	items: ItemDTO[];
	/** IDs from the most recently appended page — drives fade-in animation. */
	newIds: Set<string>;
};

type AccumulatorAction =
	| { type: 'REPLACE'; payload: ItemDTO[] }
	| { type: 'APPEND'; payload: ItemDTO[] }
	| { type: 'CLEAR_NEW_IDS' };

const accumulatorReducer = (
	state: AccumulatorState,
	action: AccumulatorAction
): AccumulatorState => {
	switch (action.type) {
		case 'REPLACE':
			// Fresh start — replaces everything (mount or search reset)
			return { items: action.payload, newIds: new Set<string>() };

		case 'APPEND': {
			// Append page 2+, deduplicating by id
			const existingIds = new Set(state.items.map((i) => i.id));
			const deduped = action.payload.filter(
				(i) => !existingIds.has(i.id)
			);
			return {
				items: [...state.items, ...deduped],
				newIds: new Set(deduped.map((i) => i.id)),
			};
		}

		case 'CLEAR_NEW_IDS':
			return { ...state, newIds: new Set<string>() };

		default:
			return state;
	}
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
 * - Accumulates items across pages for a seamless "load more" UX
 * - Applies client-side search filtering on the accumulated set
 * - Exposes draggable items for packing interactions
 *
 * Data strategy:
 * - Page 1 on mount; subsequent pages appended on user request
 * - All accumulation state lives in `accumulatorReducer` — no setState in effects
 * - Client-side filtering on the accumulated set for responsive UX
 * - `meta.count` drives the "load more" visibility
 *
 * Drag contract:
 * - Emits `data.type = 'library-item'`
 * - Consumers (drop zones) must handle this shape
 */
const ItemsPanel = ({ containerId: _containerId }: ItemsPanelProps) => {
	// Local search state — client-side filter on top of the accumulated set.
	// SearchInput debounces internally (400 ms), so no debounce needed here.
	const [search, setSearch] = useState<string | undefined>(undefined);

	// Single reducer owns all accumulation state — avoids setState-in-effect.
	const [accState, dispatch] = useReducer(accumulatorReducer, {
		items: [],
		newIds: new Set<string>(),
	});

	// Tracks the last page we've successfully merged so we don't double-append
	// on re-renders (RTK Query can re-emit the same data on cache hit).
	const lastMergedPageRef = useRef<number>(0);

	const {
		data: items,
		isLoading,
		isFetching,
		meta,
		pagination,
		setPagination,
	} = useItemsList();

	// ── Accumulation logic ──────────────────────────────────────────
	// Dispatching from an effect is allowed — the rule only blocks setState()
	// calls directly inside effect bodies. All mutations live in the reducer.
	useEffect(() => {
		if (isLoading || items.length === 0) return;
		if (pagination.page === lastMergedPageRef.current) return;

		lastMergedPageRef.current = pagination.page;

		dispatch(
			pagination.page === 1
				? { type: 'REPLACE', payload: items }
				: { type: 'APPEND', payload: items }
		);
	}, [items, pagination.page, isLoading]);

	// ── Clear fade-in flags after animation completes ───────────────
	useEffect(() => {
		if (accState.newIds.size === 0) return;
		const timer = setTimeout(
			() => dispatch({ type: 'CLEAR_NEW_IDS' }),
			400
		);
		return () => clearTimeout(timer);
	}, [accState.newIds]);

	// ── Search handler ──────────────────────────────────────────────
	// When search changes, reset pagination to page 1 so the query re-fires.
	// Clearing lastMergedPageRef lets the next page-1 result replace the list.
	const handleSearchChange = useCallback(
		(value?: string) => {
			setSearch(value);
			lastMergedPageRef.current = 0;
			if (pagination.page !== 1) {
				setPagination({ page: 1 });
			}
			// If already on page 1, the ref reset above is enough —
			// the next data emission will re-dispatch REPLACE.
		},
		[pagination.page, setPagination]
	);

	// ── Client-side filter ──────────────────────────────────────────
	const filtered =
		search && search.trim()
			? accState.items.filter((item) =>
					item.name.toLowerCase().includes(search.toLowerCase())
				)
			: accState.items;

	// ── Pagination state ────────────────────────────────────────────
	const totalItems = meta?.count ?? 0;
	const loadedCount = accState.items.length;
	const hasMore = loadedCount < totalItems && !search;

	const handleLoadMore = useCallback(() => {
		setPagination({ page: pagination.page + 1 });
	}, [pagination.page, setPagination]);

	return (
		<div className="flex flex-col gap-4 h-full" style={{ height: '100%' }}>
			{/* ── Search — always visible at top ──────────────────────── */}
			<SearchInput
				label="Search items"
				value={search}
				onChange={handleSearchChange}
				placeholder="Search items…"
				labelClassName="sr-only"
			/>

			{/* ── Count bar ───────────────────────────────────────────── */}
			{!isLoading && (totalItems > 0 || loadedCount > 0) && (
				<div className="flex items-center justify-between shrink-0 px-0.5">
					<span className="text-muted-foreground text-xs">
						{search ? (
							<>
								<span className="text-foreground font-medium">
									{filtered.length}
								</span>{' '}
								{filtered.length === 1 ? 'match' : 'matches'}
							</>
						) : (
							<>
								<span className="text-foreground font-medium">
									{loadedCount}
								</span>
								{totalItems > loadedCount && (
									<> of {totalItems}</>
								)}{' '}
								{totalItems === 1 ? 'item' : 'items'}
							</>
						)}
					</span>

					{/* Background refetch indicator */}
					{isFetching && !isLoading && (
						<div
							className="h-3 w-3 animate-spin rounded-full border-2 border-muted-foreground/40 border-t-muted-foreground"
							aria-label="Loading"
						/>
					)}
				</div>
			)}

			{/* ── Scrollable card list — flex-1 + min-h-0 is the key ── */}
			<div
				className={cn(
					'flex flex-col gap-3 flex-1 pb-4',
					// Custom scrollbar — thin, matches muted token
					'overflow-y-auto',
					'scrollbar-thin',
					// Webkit scrollbar styling via arbitrary variants
					'[&::-webkit-scrollbar]:w-1.5',
					'[&::-webkit-scrollbar-track]:rounded-full',
					'[&::-webkit-scrollbar-track]:bg-transparent',
					'[&::-webkit-scrollbar-thumb]:rounded-full',
					'[&::-webkit-scrollbar-thumb]:bg-border',
					'[&::-webkit-scrollbar-thumb:hover]:bg-muted-foreground/40'
				)}
				style={{ minHeight: 0 }}
				role="list"
				aria-label="Your items — drag to pack"
			>
				{/* Loading skeletons — page 1 initial load only */}
				{isLoading &&
					pagination.page === 1 &&
					Array.from({ length: 5 }).map((_, i) => (
						<Skeleton key={i} className="h-36 w-full rounded-xl" />
					))}

				{/* Empty / no-match state */}
				{!isLoading && filtered.length === 0 && (
					<div className="flex flex-col items-center gap-3 py-10 text-center">
						<div className="bg-muted flex h-10 w-10 items-center justify-center rounded-full">
							<HugeiconsIcon
								icon={Package01Icon}
								className="text-muted-foreground h-5 w-5"
								aria-hidden="true"
							/>
						</div>
						<p className="text-muted-foreground text-sm">
							{search
								? 'Nothing matches that search — try a different name.'
								: "You haven't added any items yet."}
						</p>
					</div>
				)}

				{/* Draggable ItemCard instances */}
				{!isLoading &&
					filtered.map((item) => (
						<div key={item.id} role="listitem">
							<DraggableItemCard
								item={item}
								isNew={accState.newIds.has(item.id)}
							/>
						</div>
					))}

				{/* Inline skeletons while loading page 2+ */}
				{isFetching &&
					!isLoading &&
					pagination.page > 1 &&
					Array.from({ length: 3 }).map((_, i) => (
						<Skeleton
							key={`page-skeleton-${i}`}
							className="h-36 w-full rounded-xl"
						/>
					))}

				{/* ── Load more ─────────────────────────────────────── */}
				{hasMore && (
					<Button
						variant="outline"
						size="sm"
						onClick={handleLoadMore}
						disabled={isFetching}
						className="w-full mt-1 gap-2 text-muted-foreground hover:text-foreground"
						aria-label={`Load more items (${totalItems - loadedCount} remaining)`}
					>
						{isFetching ? (
							<>
								<div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-muted-foreground/40 border-t-muted-foreground" />
								Loading…
							</>
						) : (
							<>
								<HugeiconsIcon
									icon={ArrowDown01Icon}
									className="h-3.5 w-3.5"
									aria-hidden="true"
								/>
								Load more
								<span className="text-muted-foreground/60 text-xs">
									({totalItems - loadedCount} more)
								</span>
							</>
						)}
					</Button>
				)}
			</div>

			{/* ── Drag hint — pinned to bottom ────────────────────────── */}
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
