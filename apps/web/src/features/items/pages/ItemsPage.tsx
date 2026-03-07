'use client';

import { useState } from 'react';

import { ListMeta, ListPagination } from '@shared-ui/list';
import { Button } from '@shadcn-ui/button';
import { Dialog, DialogContent, DialogTrigger } from '@shadcn-ui/dialog';
import { HugeiconsIcon } from '@hugeicons/react';
import { Add01Icon } from '@hugeicons/core-free-icons';

import ItemsGrid from '@features/items/components/list/ItemsGrid';
import ItemsFilters from '@features/items/components/list/ItemsFilters';
import ItemsOrderBy from '@features/items/components/list/ItemsOrderBy';
import { CreateItemForm } from '@features/items/components/forms';
import { UpdateItemForm } from '@features/items/components/forms';

import { useItemsList } from '@features/items/hooks';
import { useItemsActions } from '@features/items/hooks';

import type { ItemDTO } from '@beggy/shared/types';

/**
 * ItemsPage
 *
 * @description
 * List page for the Items feature. Composes:
 * - `useItemsList`   — pagination, filters, ordering, data
 * - `ItemsFilters`   — filter panel
 * - `ItemsOrderBy`   — sort control
 * - `ItemsGrid`      — card grid + skeleton + empty state
 * - `ListMeta`       — "Showing X of Y items"
 * - `ListPagination` — page controls
 * - `CreateItemForm` — in a Dialog triggered by the "Add item" button
 * - `UpdateItemForm` — in a Dialog opened from ItemCard actions
 *
 * @remarks
 * - `itemToEdit` drives the update dialog — set on "Edit" action,
 *   cleared on dialog close or successful update.
 * - `hasFilters` is derived from the list hook's filter state to pass
 *   to the empty state so it shows the correct copy and CTA.
 */
const ItemsPage = () => {
	// ── List state ────────────────────────────────────────────────────────────
	const {
		data: items,
		meta,
		isLoading,
		isFetching,
		filters,
		orderBy,
		setFilters,
		setOrderBy,
		setPagination,
		reset,
		refetch,
	} = useItemsList();

	// ── Mutation actions ──────────────────────────────────────────────────────
	const { remove } = useItemsActions();

	// ── Dialog state ──────────────────────────────────────────────────────────
	const [createOpen, setCreateOpen] = useState(false);
	const [itemToEdit, setItemToEdit] = useState<ItemDTO | null>(null);

	// ── Derived ───────────────────────────────────────────────────────────────
	const hasFilters =
		!!filters.category ||
		filters.isFragile !== undefined ||
		!!filters.color ||
		!!filters.weight ||
		!!filters.volume ||
		!!filters.createdAt;

	// ── Handlers ──────────────────────────────────────────────────────────────

	const handleDelete = async (item: ItemDTO) => {
		await remove(item.id, { onSuccess: refetch });
	};

	// ── Render ────────────────────────────────────────────────────────────────

	return (
		<div className="flex flex-col gap-6 p-6">
			{/* ── Page header ──────────────────────────────────────────────── */}
			<div className="flex items-center justify-between gap-4">
				<div>
					<h1 className="text-foreground text-2xl font-semibold tracking-tight">
						My Items
					</h1>
					<p className="text-muted-foreground text-sm">
						Your personal packing inventory.
					</p>
				</div>

				{/* Add item — opens create dialog */}
				<Dialog open={createOpen} onOpenChange={setCreateOpen}>
					<DialogTrigger>
						<Button>
							<HugeiconsIcon
								icon={Add01Icon}
								className="mr-2 size-4"
							/>
							Add item
						</Button>
					</DialogTrigger>
					<DialogContent className="sm:max-w-lg p-0 overflow-hidden">
						<CreateItemForm
							onSuccess={() => {
								setCreateOpen(false);
								refetch();
							}}
							onCancel={() => setCreateOpen(false)}
						/>
					</DialogContent>
				</Dialog>
			</div>

			{/* ── Toolbar: filters + order-by ──────────────────────────────── */}
			<div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
				<ItemsFilters
					value={filters}
					onChange={setFilters}
					onApply={setFilters}
					onReset={reset}
				/>
				<ItemsOrderBy value={orderBy} onChange={setOrderBy} />
			</div>

			{/* ── List meta: "Showing X of Y" ──────────────────────────────── */}
			{meta && (
				<ListMeta label="Items" meta={meta} isLoading={isLoading} />
			)}

			{/* ── Grid ─────────────────────────────────────────────────────── */}
			<ItemsGrid
				items={items}
				isLoading={isLoading}
				hasFilters={hasFilters}
				onReset={reset}
				onEdit={(item) => setItemToEdit(item)}
				onDelete={handleDelete}
			/>

			{/* ── Pagination ───────────────────────────────────────────────── */}
			{meta && (
				<ListPagination
					meta={meta}
					onPageChange={(page) => setPagination({ page })}
					isDisabled={isFetching}
				/>
			)}

			{/* ── Edit dialog ──────────────────────────────────────────────── */}
			<Dialog
				open={!!itemToEdit}
				onOpenChange={(open) => {
					if (!open) setItemToEdit(null);
				}}
			>
				<DialogContent className="sm:max-w-lg p-0 overflow-hidden">
					{itemToEdit && (
						<UpdateItemForm
							item={itemToEdit}
							onSuccess={() => {
								setItemToEdit(null);
								refetch();
							}}
							onCancel={() => setItemToEdit(null)}
						/>
					)}
				</DialogContent>
			</Dialog>
		</div>
	);
};

export default ItemsPage;
