'use client';

import { useState } from 'react';
import { Card, CardContent } from '@shadcn-ui/card';
import {
	UsersEmptyState,
	UsersFilters,
	UsersGrid,
	UsersOrderBy,
} from '@features/users/components/list';
import { CreateUserDialog } from '@features/users/components/dialogs';
import { ListMeta, ListPagination } from '@shared-ui/list';
import { useUsersList } from '@features/users/hooks';

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
	} = useUsersList();

	// Draft filters let users build up a filter state before applying it
	const [draftFilters, setDraftFilters] = useState(filters);

	return (
		<section className="flex flex-col gap-8">
			{/* ── 1. Page header ──────────────────────────────────────── */}
			<header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div className="flex flex-col gap-1">
					<h1 className="text-2xl font-semibold tracking-tight text-foreground">
						Users
					</h1>
					<p className="text-sm text-muted-foreground">
						Manage system users, roles, and account status.
					</p>
				</div>

				<CreateUserDialog />
			</header>

			{/* ── 2. Control surface ──────────────────────────────────── */}
			{/*
			 * shadcn Card already applies bg-card + border + border-border + rounded-xl.
			 * We use CardContent for correct internal padding — never override Card's
			 * bg or border via className (that would fight the design system token).
			 */}
			<Card>
				<CardContent className="p-5">
					<div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
						<UsersFilters
							value={draftFilters}
							onChange={setDraftFilters}
							onApply={(applied) => setFilters(applied)}
							onReset={() => {
								setDraftFilters({});
								reset();
							}}
						/>

						<UsersOrderBy
							value={orderBy}
							onChange={(next) => setOrderBy(next)}
						/>
					</div>
				</CardContent>
			</Card>

			{/* ── 3. Content surface ──────────────────────────────────── */}
			{/*
			 * No Card wrapper here — the grid itself provides the visual surface.
			 * Adding a Card around a grid would create unnecessary nesting and
			 * a "double border" effect that clutters the layout.
			 */}
			<UsersGrid
				users={data}
				isLoading={isLoading}
				empty={
					<UsersEmptyState
						hasFilters={!!Object.keys(filters ?? {}).length}
						onReset={reset}
					/>
				}
			/>

			{/* ── 4. Footer bar — conditional on meta ─────────────────── */}
			{/*
			 * Only renders when meta is available (i.e. after the first successful fetch).
			 * Uses Card for surface consistency with the control surface above.
			 */}
			{meta && (
				<Card>
					<CardContent className="flex flex-col gap-4 p-4 lg:flex-row lg:items-center lg:justify-between">
						{/*
						 * text-muted-foreground is the correct token for list metadata
						 * (record count, page info) — secondary content, not headings
						 */}
						<ListMeta meta={meta} isLoading={isLoading} />

						<ListPagination
							meta={meta}
							onPageChange={(page) => setPagination({ page })}
							isDisabled={isFetching}
						/>
					</CardContent>
				</Card>
			)}
		</section>
	);
};

export default UsersPage;
