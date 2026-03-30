'use client';

import { useState } from 'react';

import { ListMeta, ListPagination } from '@shared-ui/list';

import BagsGrid from '@features/bags/components/list/BagsGrid';
import BagsFilters from '@features/bags/components/list/BagsFilters';
import BagsOrderBy from '@features/bags/components/list/BagsOrderBy';
import { CreateBagDialog } from '@features/bags/components/dialogs';
import { UpdateBagDialog } from '@features/bags/components/dialogs';

import useBagsList from '@features/bags/hooks/useBagsList';
import useBagActions from '@features/bags/hooks/useBagActions';

import { notify } from '@shared/utils/notify.utils';

import type { BagDTO } from '@beggy/shared/types';
import { HttpClientError } from '@shared/types';
import { SuccessMessages } from '@beggy/shared/constants';

// ─── Component ─────────────────────────────────────────────────────────────────

/**
 * BagsPage
 *
 * @description
 * Page orchestrator for the Bags list route (`/bags`).
 *
 * @remarks
 * Hook wiring:
 * - `useBagsList`    — list query state (data, filters, orderBy, pagination)
 * - `useBagActions`  — mutation wrappers with built-in error handling.
 *                      `remove(id, callbacks)` handles the delete flow.
 *                      Notify calls live here — hooks expose callbacks, pages own feedback.
 * - `bagToEdit`      — drives `UpdateBagDialog` (null = closed, BagDTO = open)
 *
 * Dialog ownership:
 * - `CreateBagDialog` — self-contained open/close state via `FormDialog` trigger
 * - `UpdateBagDialog` — controlled via nullable-bag pattern
 */
const BagsPage = () => {
	// ── List state ───────────────────────────────────────────────────────────
	const {
		data: bags,
		isLoading,
		isFetching,
		meta,
		filters,
		orderBy,
		setFilters,
		setOrderBy,
		setPagination,
		reset,
		refetch,
	} = useBagsList();

	// ── Edit dialog state ────────────────────────────────────────────────────
	const [bagToEdit, setBagToEdit] = useState<BagDTO | null>(null);

	// ── Mutations ────────────────────────────────────────────────────────────
	const { remove, isDeleting } = useBagActions();

	// ── Handlers ─────────────────────────────────────────────────────────────

	const handleDelete = (bag: BagDTO) => {
		remove(bag.id, {
			onSuccess: () => {
				notify.success({ message: SuccessMessages.BAG_DELETED });
				refetch();
			},
			onError: (err: unknown) =>
				notify.error.fromHttp(err as HttpClientError),
		});
	};

	// ── Derived ──────────────────────────────────────────────────────────────

	const hasActiveFilters = Object.values(filters).some(
		(v) =>
			v !== undefined &&
			v !== null &&
			v !== '' &&
			!(Array.isArray(v) && v.length === 0)
	);

	return (
		<div className="flex flex-col gap-6">
			{/* ── Header ───────────────────────────────────────────────────── */}
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-foreground text-2xl font-semibold">
						Bags
					</h1>
					<p className="text-muted-foreground text-sm">
						Manage your packing bags and their capacity constraints.
					</p>
				</div>

				<CreateBagDialog onSuccess={refetch} />
			</div>

			{/* ── Controls bar ─────────────────────────────────────────────── */}
			<div className="flex flex-wrap items-center gap-3">
				<BagsFilters
					value={filters}
					onApply={setFilters}
					onChange={setFilters}
					onReset={reset}
				/>

				<BagsOrderBy value={orderBy} onChange={setOrderBy} />

				<div className="ms-auto">
					<ListMeta meta={meta} isLoading={isLoading} label="bags" />
				</div>
			</div>

			{/* ── Grid ─────────────────────────────────────────────────────── */}
			<BagsGrid
				bags={bags}
				isLoading={isLoading}
				hasFilters={hasActiveFilters}
				onResetFilters={reset}
				onEdit={(bag) => setBagToEdit(bag)}
				onDelete={handleDelete}
				deletingId={isDeleting ? (bagToEdit?.id ?? null) : null}
			/>

			{/* ── Pagination ───────────────────────────────────────────────── */}
			<ListPagination
				meta={meta}
				onPageChange={(page) => setPagination({ page })}
				isDisabled={isLoading || isFetching}
			/>

			{/* ── Update dialog ────────────────────────────────────────────── */}
			<UpdateBagDialog
				bag={bagToEdit}
				onClose={() => setBagToEdit(null)}
				onSuccess={() => {
					setBagToEdit(null);
					refetch();
				}}
			/>
		</div>
	);
};

export default BagsPage;
