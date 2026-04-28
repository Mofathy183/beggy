'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ListMeta, ListPagination } from '@shared-ui/list';

import {
	ItemsGrid,
	ItemsFilters,
	ItemsOrderBy,
} from '@features/items/components/list';
import {
	CreateItemDialog,
	UpdateItemDialog,
} from '@features/items/components/dialogs';
import { useItemsList, useItemsActions } from '@features/items/hooks';
import { useProfileSyncWithAuth } from '@features/profiles/hooks';

import type { ItemDTO } from '@beggy/shared/types';
import { notify } from '@/shared/utils';
import { SuccessMessages } from '@beggy/shared';

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
	const router = useRouter();
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

	const { syncProfile } = useProfileSyncWithAuth();

	// ── Dialog state ──────────────────────────────────────────────────────────
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
		await remove(item.id, {
			onSuccess: () => {
				notify.success({ message: SuccessMessages['ITEM_DELETED'] });
				refetch();
			},
		});
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

				{/* Add item — self-contained, owns its own open state */}
				<CreateItemDialog onSuccess={refetch} />
			</div>

			{/* ── Toolbar: filters + order-by ──────────────────────────────── */}
			<div className="flex flex-wrap items-center gap-3">
				<ItemsFilters
					value={filters}
					onApply={setFilters}
					onReset={reset}
				/>
				<ItemsOrderBy value={orderBy} onChange={setOrderBy} />

				{/* ── List meta: "Showing X of Y" ──────────────────────────────── */}
				<div className="ms-auto">
					<ListMeta label="Items" meta={meta} isLoading={isLoading} />
				</div>
			</div>

			{/* ── Grid ─────────────────────────────────────────────────────── */}
			<ItemsGrid
				items={items}
				isLoading={isLoading}
				hasFilters={hasFilters}
				onReset={reset}
				onSelect={(item) => router.push(`/items/${item.id}`)}
				onEdit={(item) => setItemToEdit(item)}
				onDelete={(item) => void handleDelete(item)}
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
			<UpdateItemDialog
				item={itemToEdit}
				onClose={() => setItemToEdit(null)}
				onSuccess={() => {
					syncProfile();
					setItemToEdit(null);
					refetch();
				}}
			/>
		</div>
	);
};

export default ItemsPage;
