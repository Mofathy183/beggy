import type {
	ItemCategoryStatsDto,
	ItemStatsDto,
	RecentItemDto,
} from '@beggy/shared';

/**
 * Dashboard section containing item-related insights.
 *
 * @remarks
 * - `categories` may be omitted for performance or partial responses
 */
export interface DashboardItemsSectionDto {
	stats: ItemStatsDto;
	recent: RecentItemDto[];
	categories?: ItemCategoryStatsDto[];
}

export interface DashboardProfileDto {
	onboardingCompleted: boolean;
}

/**
 * Complete dashboard response for the authenticated user.
 *
 * @remarks
 * - Acts as the primary API contract for the dashboard page
 * - Aggregates multiple domain sections into a single payload
 * - Designed for direct UI consumption (no additional transformation required)
 */
export interface DashboardOverviewDto {
	/**
	 * Profile-related insights (e.g. onboarding state).
	 */
	profile: DashboardProfileDto;

	/**
	 * Item-related insights (stats, recent items, category distribution).
	 */
	items: DashboardItemsSectionDto;

	// TODO:
	// bags?: DashboardBagsSectionDto;
	// recommendations?: DashboardRecommendationDto;
	// weather?: DashboardWeatherDto;
}
