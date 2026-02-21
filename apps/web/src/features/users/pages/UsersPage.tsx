'use client';

import { useState } from 'react';
import { Button } from '@shadcn-ui/button';
import { Card } from '@shadcn-ui/card';

import {
	UsersEmptyState,
	UsersFilters,
	UsersGrid,
	UsersOrderBy,
} from '@features/users/components/list';

import { ListMeta, ListPagination } from '@shared-ui/list';
import { useUsersList } from '@features/users/hooks';

const UsersPage = () => {
	console.log('API URL:', process.env.NEXT_PUBLIC_API_URL);
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

	const [draftFilters, setDraftFilters] = useState(filters);

	return (
		<section className="space-y-8">
			{/* 1️⃣ Page Header */}
			<header className="flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-semibold text-foreground">
						Users
					</h1>
					<p className="text-sm text-muted-foreground">
						Manage system users, roles, and account status.
					</p>
				</div>

				<Button variant="default">Create User</Button>
			</header>

			{/* 2️⃣ Control Surface */}
			<Card className="bg-card border border-border p-5 space-y-6">
				<div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
					<UsersFilters
						value={draftFilters}
						onChange={setDraftFilters}
						onApply={(filters) => setFilters(filters)}
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
			</Card>

			{/* 3️⃣ Content Surface */}
			<div className="space-y-6">
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
			</div>

			{/* 4️⃣ Footer Bar */}
			{meta && (
				<Card className="bg-card border border-border p-4 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
					<ListMeta meta={meta} isLoading={isLoading} />

					<ListPagination
						meta={meta}
						onPageChange={(page) => setPagination({ page })}
						isDisabled={isFetching}
					/>
				</Card>
			)}
		</section>
	);
};

export default UsersPage;
