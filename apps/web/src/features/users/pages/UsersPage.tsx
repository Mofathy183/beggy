'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ListMeta, ListPagination } from '@shared-ui/list';

import {
	UsersFilters,
	UsersGrid,
	UsersOrderBy,
} from '@features/users/components/list';
import { CreateUserDialog } from '@features/users/components/dialogs';
import { useUsersList, useUserActions } from '@features/users/hooks';
import { useAppSelector } from '@shared/store/hooks';
import { selectAuthUser } from '@features/auth/store';
import { notify } from '@shared/utils/notify.utils';
import type { AdminUserDTO } from '@beggy/shared/types';

/**
 * UsersPage
 *
 * Admin/Moderator page for browsing and managing system users.
 *
 * Layout (top → bottom):
 *  1. Page header     — title + description + Create User CTA
 *  2. Control surface — filters + sort controls (Card)
 *  3. Content surface — user grid
 *  4. Footer bar      — list meta + pagination (Card, conditional)
 *
 * Design system compliance (§12):
 *  - All colors via semantic tokens only (bg-card, border-border, text-foreground, etc.)
 *  - shadcn Card used via its sub-components (CardContent) — no className overrides
 *  - Semantic text hierarchy: text-foreground for headings, text-muted-foreground for subtitles
 *  - Button variant="default" for primary CTA
 */
const UsersPage = () => {
	const router = useRouter();
	const currentUser = useAppSelector(selectAuthUser);

	const {
		data,
		meta,
		isLoading,
		isFetching,
		filters,
		orderBy,
		setPagination,
		setFilters,
		setOrderBy,
		reset,
		refetch,
	} = useUsersList();

	// ── Per-user mutation state — mirrors BagsPage.deletingId pattern ────────
	const [deletingId, setDeletingId] = useState<string | null>(null);
	const [updatingStatusId, setUpdatingStatusId] = useState<string | null>(
		null
	);

	const { activate, deactivate, remove } = useUserActions();

	// ── Handlers ─────────────────────────────────────────────────────────────

	const handleToggleStatus = useCallback(
		async (user: AdminUserDTO) => {
			setUpdatingStatusId(user.id);
			if (user.isActive) {
				await deactivate(user.id, {
					onSuccess: () => {
						notify.success({ message: 'User deactivated' });
						refetch();
					},
				});
			} else {
				await activate(user.id, {
					onSuccess: () => {
						notify.success({ message: 'User activated' });
						refetch();
					},
				});
			}
			setUpdatingStatusId(null);
		},
		[activate, deactivate, refetch]
	);

	const handleDelete = useCallback(
		async (user: AdminUserDTO) => {
			setDeletingId(user.id);
			await remove(user.id, {
				onSuccess: () => {
					notify.success({ message: 'User deleted' });
					refetch();
				},
			});
			setDeletingId(null);
		},
		[remove, refetch]
	);

	// ── Derived ──────────────────────────────────────────────────────────────

	const hasActiveFilters = Object.values(filters ?? {}).some(
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
						Users
					</h1>
					<p className="text-muted-foreground text-sm">
						Manage system users, roles, and account status.
					</p>
				</div>

				<CreateUserDialog />
			</div>

			{/*
			 * ── Controls bar ─────────────────────────────────────────────────
			 *
			 * Mirrors BagsPage exactly:
			 * [Filters trigger] [Sort] ··· [Showing X–Y of Z users]
			 *
			 * UsersFilters renders as a popover trigger button — not an
			 * expanded card. If your current UsersFilters renders as a card,
			 * that's a component-level issue to fix there, not here.
			 * The layout wrapper here is correct regardless.
			 */}
			{/* ── Filters (FULL WIDTH CARD) ── */}
			<UsersFilters
				value={filters}
				onApply={setFilters}
				onReset={reset}
			/>

			{/* ── Controls bar (Sort + Meta) ── */}
			<div className="flex flex-wrap items-center gap-3">
				<UsersOrderBy value={orderBy} onChange={setOrderBy} />

				<div className="ms-auto">
					<ListMeta meta={meta} isLoading={isLoading} label="users" />
				</div>
			</div>

			{/* ── Grid ─────────────────────────────────────────────────────── */}
			<UsersGrid
				users={data}
				isLoading={isLoading}
				hasFilters={hasActiveFilters}
				onResetFilters={reset}
				onSelect={(user) => router.push(`/users/${user.id}`)}
				onEdit={(user) => router.push(`/users/${user.id}`)}
				onToggleStatus={(user) => void handleToggleStatus(user)}
				onDelete={(user) => void handleDelete(user)}
				currentUserId={currentUser?.id}
				updatingStatusId={updatingStatusId}
				deletingId={deletingId}
			/>

			{/*
			 * ── Pagination ───────────────────────────────────────────────────
			 *
			 * Flat — no Card wrapper. Matches BagsPage exactly.
			 * The card + "Page 1 of" text in the screenshot came from
			 * the old UsersPage wrapping ListPagination in a Card with
			 * CardContent. Removed here.
			 */}
			<ListPagination
				meta={meta}
				onPageChange={(page) => setPagination({ page })}
				isDisabled={isLoading || isFetching}
			/>
		</div>
	);
};

export default UsersPage;
