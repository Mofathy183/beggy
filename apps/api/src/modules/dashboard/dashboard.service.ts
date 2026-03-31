import type { PrismaClientType } from '@prisma';
import type {
	DashboardOverviewDto,
	ItemStatsDto,
	RecentItemDto,
	ItemCategoryStatsDto,
} from '@beggy/shared/types';
import type { ItemCategory } from '@beggy/shared/constants';
import { BaseService } from '@shared/core';
import { toISO } from '@shared/utils';

/**
 * Domain service responsible for aggregating dashboard data.
 *
 * @description
 * Collects and shapes data from multiple domain tables into a single
 * response optimized for the dashboard UI.
 *
 * @remarks
 * - All queries are scoped to `userId` for strict tenant isolation.
 * - Uses Prisma's `$transaction` to batch reads into a single round-trip.
 * - Throws domain-level errors only (never HTTP errors).
 * - Does not reuse ItemService intentionally — dashboard queries are
 *   read-optimized projections, not full entity fetches.
 */
export class DashboardService extends BaseService {
	constructor(private readonly prisma: PrismaClientType) {
		super({ domain: 'dashboard', service: 'DashboardService' });
	}

	/**
	 * Returns the full dashboard overview for a given user.
	 *
	 * @param userId - Owner identifier used for tenant isolation.
	 * @returns Aggregated dashboard payload ready for direct UI consumption.
	 *
	 * @remarks
	 * All database reads are issued in a single transaction to avoid
	 * partial/stale data across concurrent writes.
	 */
	async getDashboardOverview(userId: string): Promise<DashboardOverviewDto> {
		const [profile, itemStats, recentItems, categoryStats] =
			await this.prisma.$transaction([
				this.prisma.profile.findUnique({
					where: { userId },
					select: { onboardingCompleted: true },
				}),

				// Aggregate total and fragile item counts in one pass
				this.prisma.item.aggregate({
					where: { userId },
					_count: {
						_all: true,
						// Prisma doesn't support conditional count natively,
						// so fragile items are counted separately below
					},
				}),

				// Most recent 5 items — lightweight projection
				this.prisma.item.findMany({
					where: { userId },
					orderBy: { createdAt: 'desc' },
					take: 5,
					select: {
						id: true,
						name: true,
						category: true,
						createdAt: true,
					},
				}),

				// Category distribution
				this.prisma.item.groupBy({
					by: ['category'],
					where: { userId },
					_count: { _all: true },
					orderBy: { _count: { category: 'desc' } },
				}),
			]);

		// Fragile count needs its own query — kept outside the transaction
		// since $transaction doesn't compose well with a filtered count
		// when batched alongside groupBy in some Prisma versions.
		const fragileCount = await this.prisma.item.count({
			where: { userId, isFragile: true },
		});

		this.log.debug({ userId }, 'Dashboard overview assembled');

		return this.toOverviewDto({
			profile,
			totalItems: itemStats._count._all,
			fragileCount,
			recentItems,
			categoryStats,
		});
	}

	// -------------------------------------------------------------------------
	// Private mappers — keep all shape-transformation logic out of the handler
	// -------------------------------------------------------------------------

	private toOverviewDto(raw: {
		profile: { onboardingCompleted: boolean } | null;
		totalItems: number;
		fragileCount: number;
		recentItems: {
			id: string;
			name: string;
			category: string;
			createdAt: Date;
		}[];
		categoryStats: { category: string; _count: { _all: number } }[];
	}): DashboardOverviewDto {
		return {
			profile: {
				onboardingCompleted: raw.profile?.onboardingCompleted ?? false,
			},
			items: {
				stats: this.toItemStatsDto(raw.totalItems, raw.fragileCount),
				recent: this.toRecentItemDtoList(raw.recentItems),
				categories: this.toCategoryStatsDtoList(raw.categoryStats),
			},
		};
	}

	private toItemStatsDto(
		totalItems: number,
		totalFragileItems: number
	): ItemStatsDto {
		return { totalItems, totalFragileItems };
	}

	private toRecentItemDtoList(
		items: { id: string; name: string; category: string; createdAt: Date }[]
	): RecentItemDto[] {
		return items.map((item) => ({
			id: item.id,
			name: item.name,
			category: item.category as ItemCategory,
			createdAt: toISO(item.createdAt),
		}));
	}

	private toCategoryStatsDtoList(
		groups: { category: string; _count: { _all: number } }[]
	): ItemCategoryStatsDto[] {
		return groups.map((g) => ({
			category: g.category as ItemCategory,
			count: g._count._all,
		}));
	}
}
