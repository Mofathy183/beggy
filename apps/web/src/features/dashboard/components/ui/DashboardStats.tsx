'use client';

import { HugeiconsIcon, type IconSvgElement } from '@hugeicons/react';
import {
	Package01Icon,
	Alert02Icon,
	FilterIcon,
	GridIcon,
} from '@hugeicons/core-free-icons';
import { Card, CardContent, CardHeader, CardTitle } from '@shadcn-ui/card';
import { Skeleton } from '@shadcn-ui/skeleton';
import type { ItemCategoryStatsDto, ItemStatsDto } from '@beggy/shared/types';
import { ITEM_CATEGORY_OPTIONS, getEnumLabel } from '@shared-ui/mappers';
import { cn } from '@shadcn-lib';
import ErrorState from '@shared-ui/states/ErrorState';

interface DashboardStatsProps {
	stats: ItemStatsDto | undefined;
	topCategory: ItemCategoryStatsDto | undefined;
	totalCategories: number | undefined;
	isLoading: boolean;
	isError: boolean;
	onRetry: () => void;
}

/**
 * @description
 * Configuration contract for a single dashboard stat card.
 *
 * @remarks
 * Encapsulates both presentation (label, icon) and value derivation logic.
 * Enables scalable addition of new stats without modifying rendering logic.
 */
interface StatCard {
	key: string;
	label: string;
	icon: IconSvgElement;
	iconBg: string;
	iconColor: string;

	/**
	 * Resolves the primary value displayed in the card.
	 */
	getValue: (
		s: ItemStatsDto | undefined,
		tc: ItemCategoryStatsDto | undefined,
		tl: number | undefined
	) => string | number | null;

	/**
	 * Resolves the supporting description text.
	 */
	getSub: (
		s: ItemStatsDto | undefined,
		tc: ItemCategoryStatsDto | undefined
	) => string;

	/**
	 * Indicates whether the value is textual (affects typography).
	 */
	isText?: boolean;
}

/**
 * @description
 * Declarative configuration for all dashboard stat cards.
 *
 * @remarks
 * - Keeps rendering logic simple and consistent.
 * - Uses shared enum mappers to ensure UI consistency across the app.
 */
const STAT_CARDS: StatCard[] = [
	{
		key: 'totalItems',
		label: 'Total items',
		icon: Package01Icon,
		iconBg: 'bg-primary/10',
		iconColor: 'text-primary',
		getValue: (s) => s?.totalItems ?? null,
		getSub: () => 'across all categories',
	},
	{
		key: 'fragile',
		label: 'Fragile items',
		icon: Alert02Icon,
		iconBg: 'bg-destructive/10',
		iconColor: 'text-destructive',
		getValue: (s) => s?.totalFragileItems ?? null,
		getSub: () => 'require careful packing',
	},
	{
		key: 'topCategory',
		label: 'Top category',
		icon: FilterIcon,
		iconBg: 'bg-success/10',
		iconColor: 'text-success',
		isText: true,
		/**
		 * Uses shared enum mapping to ensure consistent labeling across UI.
		 */
		getValue: (_s, tc) =>
			tc
				? (getEnumLabel(ITEM_CATEGORY_OPTIONS, tc.category) ??
					tc.category)
				: null,
		getSub: (s, tc) =>
			tc && s ? `${tc.count} of ${s.totalItems} items` : 'no items yet',
	},
	{
		key: 'categories',
		label: 'Categories used',
		icon: GridIcon,
		iconBg: 'bg-warning/10',
		iconColor: 'text-warning-foreground',
		getValue: (_s, _tc, tl) => tl ?? null,
		getSub: () => 'out of 8 available',
	},
];

// ─── Skeleton card ─────────────────────────────────────────────────────────

/**
 * @description
 * Placeholder card matching the layout of a stat card during loading.
 */
const StatCardSkeleton = () => (
	<Card>
		<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
			<Skeleton className="h-3.5 w-24 rounded" />
			<Skeleton className="h-7 w-7 rounded-md" />
		</CardHeader>
		<CardContent>
			<Skeleton className="h-7 w-16 rounded-md" />
			<Skeleton className="mt-1.5 h-3 w-28 rounded" />
		</CardContent>
	</Card>
);

// ─── Component ─────────────────────────────────────────────────────────────

/**
 * @description
 * Displays aggregated dashboard statistics in a responsive card grid.
 *
 * @remarks
 * - Uses a configuration-driven approach (`STAT_CARDS`) for scalability.
 * - Handles mutually exclusive states: error → loading → data.
 * - Falls back to a placeholder (`—`) when values are unavailable.
 */
const DashboardStats = ({
	stats,
	topCategory,
	totalCategories,
	isLoading,
	isError,
	onRetry,
}: DashboardStatsProps) => {
	return (
		<section>
			<p className="text-foreground mb-3 text-[15px] font-medium">
				Overview
			</p>

			{isError ? (
				<ErrorState reset={onRetry} />
			) : (
				<div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
					{isLoading
						? Array.from({ length: STAT_CARDS.length }).map(
								(_, i) => <StatCardSkeleton key={i} />
							)
						: STAT_CARDS.map((card) => {
								const value = card.getValue(
									stats,
									topCategory,
									totalCategories
								);
								const sub = card.getSub(stats, topCategory);

								return (
									<Card key={card.key}>
										<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
											<CardTitle className="text-muted-foreground text-xs font-normal">
												{card.label}
											</CardTitle>
											<div
												className={cn(
													'flex h-7 w-7 shrink-0 items-center justify-center rounded-md',
													card.iconBg
												)}
											>
												<HugeiconsIcon
													icon={card.icon}
													className={cn(
														'h-3.5 w-3.5',
														card.iconColor
													)}
												/>
											</div>
										</CardHeader>
										<CardContent>
											<p
												className={cn(
													'text-foreground font-medium leading-none',
													card.isText
														? 'text-lg'
														: 'text-2xl'
												)}
											>
												{value ?? '—'}
											</p>
											<p className="text-muted-foreground mt-1.5 text-xs">
												{sub}
											</p>
										</CardContent>
									</Card>
								);
							})}
				</div>
			)}
		</section>
	);
};

export default DashboardStats;
