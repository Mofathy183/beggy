import { buildItems } from '@modules/items/__tests__/factories/item.factory';
import { buildProfile } from '@modules/profiles/__tests__/factories/profile.factory';

import type {
	DashboardOverviewDto,
	ItemStatsDto,
	RecentItemDto,
	ItemCategoryStatsDto,
} from '@beggy/shared/types';

import { ItemCategory } from '@beggy/shared/constants';

export type DashboardOverviewOverrides = Partial<DashboardOverviewDto>;

type DashboardBuilderOptions = {
	withCategories?: boolean;
	itemsCount?: number;
	recentCount?: number;
};

/**
 * Maps item models into aggregated statistics used in the dashboard.
 *
 * @param items - Generated item models
 * @returns Aggregated item statistics
 */
const mapItemsToStats = (
	items: ReturnType<typeof buildItems>
): ItemStatsDto => {
	return {
		totalItems: items.length,
		totalFragileItems: items.filter((item) => item.isFragile).length,
	};
};

/**
 * Extracts a subset of items to simulate "recent items" in the dashboard.
 *
 * @remarks
 * Assumes items are pre-sorted by creation date in descending order.
 * If factory behavior changes, this may produce incorrect "recent" data.
 *
 * @param items - Generated item models
 * @param recentCount - Number of recent items to include
 * @returns List of recent items DTOs
 */
const mapItemsToRecent = (
	items: ReturnType<typeof buildItems>,
	recentCount: number
): RecentItemDto[] => {
	return items.slice(0, recentCount).map((item) => ({
		id: item.id,
		name: item.name,
		category: item.category as ItemCategory,
		createdAt: item.createdAt.toISOString(),
	}));
};

/**
 * Groups items by category and counts occurrences.
 *
 * @param items - Generated item models
 * @returns Category distribution for dashboard insights
 */
const mapItemsToCategoryStats = (
	items: ReturnType<typeof buildItems>
): ItemCategoryStatsDto[] => {
	const map = new Map<ItemCategory, number>();

	for (const item of items) {
		const category = item.category as ItemCategory;
		map.set(category, (map.get(category) ?? 0) + 1);
	}

	return Array.from(map.entries()).map(([category, count]) => ({
		category,
		count,
	}));
};

/**
 * Builds a complete dashboard overview DTO for testing scenarios.
 *
 * @description
 * Combines profile and item data into a structure matching the dashboard API response.
 * Supports partial overrides to simulate edge cases or specific UI states.
 *
 * @param userId - Identifier used to scope generated data
 * @param overrides - Partial overrides for fine-grained control of output
 * @param options - Builder configuration (counts, category inclusion)
 *
 * @returns Fully constructed dashboard overview DTO
 *
 * @example
 * buildDashboardOverview(userId, {
 *   items: { stats: { totalItems: 0, totalFragileItems: 0 } }
 * });
 */
export const buildDashboardOverview = (
	userId: string,
	overrides: DashboardOverviewOverrides = {},
	options: DashboardBuilderOptions = {}
): DashboardOverviewDto => {
	const itemsCount = options.itemsCount ?? 10;
	const recentCount = options.recentCount ?? 5;

	const profileModel = buildProfile(userId);
	const itemsModels = buildItems(itemsCount, userId);

	const profile = {
		onboardingCompleted:
			overrides.profile?.onboardingCompleted ??
			profileModel.onboardingCompleted,
	};

	const stats = overrides.items?.stats ?? mapItemsToStats(itemsModels);

	const recent =
		overrides.items?.recent ?? mapItemsToRecent(itemsModels, recentCount);

	const categories = options.withCategories
		? (overrides.items?.categories ?? mapItemsToCategoryStats(itemsModels))
		: undefined;

	return {
		profile,
		items: {
			stats,
			recent,
			...(categories && { categories }),
		},
	};
};
