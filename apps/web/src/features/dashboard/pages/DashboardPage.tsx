'use client';

import { useEffect, useCallback } from 'react';
import { Skeleton } from '@shadcn-ui/skeleton';
import { useAppDispatch } from '@shared/store/hooks';
import { setOnboardingCompleted } from '@features/dashboard/store';
import {
	useDashboardOverview,
	useRecentItemActions,
} from '@features/dashboard/hooks';
import {
	OnboardingNudge,
	DashboardStats,
	RecentItems,
} from '@features/dashboard/components';
import { notify } from '@shared/utils';
import type { HttpClientError } from '@shared/types';

/**
 * @description
 * Dashboard page container responsible for orchestrating data, state, and UI composition.
 *
 * @remarks
 * - Acts as the composition root for dashboard-related components.
 * - Coordinates data fetching, global state synchronization, and user interactions.
 * - Owns side effects such as notifications, keeping child components purely presentational.
 */
const DashboardPage = () => {
	const dispatch = useAppDispatch();

	const { data, isLoading, isError, refetch } = useDashboardOverview();

	const { onViewAll, onAddItem, onEdit, onDelete, isDeleting } =
		useRecentItemActions();

	/**
	 * Synchronizes onboarding completion status from API into global state.
	 *
	 * @remarks
	 * Ensures UI elements like onboarding nudges reflect the latest backend state.
	 */
	useEffect(() => {
		if (data?.profile.onboardingCompleted !== undefined) {
			dispatch(setOnboardingCompleted(data.profile.onboardingCompleted));
		}
	}, [data?.profile.onboardingCompleted, dispatch, isLoading, isError]);

	/**
	 * Handles item deletion with user feedback.
	 *
	 * @param id - Identifier of the item to delete.
	 *
	 * @remarks
	 * - Wraps the raw delete action with success/error notifications.
	 * - Keeps mutation side effects localized at the page level.
	 */
	const handleDelete = useCallback(
		async (id: string) => {
			try {
				await onDelete(id);
				notify.success({ message: 'Item removed successfully' });
			} catch (err: unknown) {
				notify.error.fromHttp(err as HttpClientError);
			}
		},
		[onDelete]
	);

	return (
		<section className="flex flex-col gap-6 p-6">
			{/* Page header */}
			<article>
				{isLoading ? (
					<>
						<Skeleton className="h-7 w-32 rounded-md" />
						<Skeleton className="mt-1.5 h-4 w-56 rounded" />
					</>
				) : (
					<>
						<h1 className="text-foreground text-2xl font-medium">
							Dashboard
						</h1>
						<p className="text-muted-foreground mt-1 text-sm">
							Here's what's in your travel library.
						</p>
					</>
				)}
			</article>

			{/* Onboarding nudge — self-guards internally */}
			<OnboardingNudge />

			{/* Stats */}
			<DashboardStats
				stats={data?.items.stats}
				topCategory={data?.items.categories?.[0]}
				totalCategories={data?.items.categories?.length}
				isLoading={isLoading}
				isError={isError}
				onRetry={refetch}
			/>

			{/* Recent items */}
			<RecentItems
				items={data?.items.recent ?? []}
				isLoading={isLoading ?? isDeleting}
				isError={isError}
				onRetry={refetch}
				onViewAll={onViewAll}
				onAddItem={onAddItem}
				onEdit={onEdit}
				onDelete={handleDelete}
			/>
		</section>
	);
};

export default DashboardPage;
