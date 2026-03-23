import { describe, it, expect, vi, beforeEach } from 'vitest';

import { DashboardService } from '../dashboard.service';

import { buildDashboardOverview } from '../__tests__/factories/dashboard.factory';
import { buildItems } from '@modules/items/__tests__/factories/item.factory';

import { toISO } from '@shared/utils';

describe('DashboardService', () => {
	let mockPrisma: any;
	let service: DashboardService;

	const userId = 'user-id';

	beforeEach(() => {
		mockPrisma = {
			$transaction: vi.fn(),

			profile: {
				findUnique: vi.fn(),
			},

			item: {
				aggregate: vi.fn(),
				findMany: vi.fn(),
				groupBy: vi.fn(),
				count: vi.fn(),
			},
		};

		service = new DashboardService(mockPrisma);
	});

	it('returns dashboard overview for valid data', async () => {
		// Arrange
		const expected = buildDashboardOverview(
			userId,
			{},
			{ withCategories: true }
		);

		// Build Prisma response FROM expected (source of truth)

		const transactionResult = [
			{ onboardingCompleted: expected.profile.onboardingCompleted },

			{
				_count: { _all: expected.items.stats.totalItems },
			},

			expected.items.recent.map((item) => ({
				id: item.id,
				name: item.name,
				category: item.category,
				createdAt: new Date(item.createdAt),
			})),

			expected.items.categories!.map((c) => ({
				category: c.category,
				_count: { _all: c.count },
			})),
		];

		mockPrisma.$transaction.mockResolvedValue(transactionResult);

		mockPrisma.item.count.mockResolvedValue(
			expected.items.stats.totalFragileItems
		);

		// Act
		const result = await service.getDashboardOverview(userId);

		// Assert
		expect(result).toEqual(expected);

		expect(mockPrisma.$transaction).toHaveBeenCalledOnce();

		expect(mockPrisma.item.count).toHaveBeenCalledWith({
			where: { userId, isFragile: true },
		});
	});

	it('returns default onboarding value when profile is null', async () => {
		// Arrange
		const items = buildItems(5, userId);

		mockPrisma.$transaction.mockResolvedValue([
			null,
			{ _count: { _all: items.length } },
			[],
			[],
		]);

		mockPrisma.item.count.mockResolvedValue(0);

		// Act
		const result = await service.getDashboardOverview(userId);

		// Assert
		expect(result.profile.onboardingCompleted).toBe(false);
	});

	it('formats recent item dates as ISO strings', async () => {
		// Arrange
		const items = buildItems(3, userId);

		mockPrisma.$transaction.mockResolvedValue([
			{ onboardingCompleted: true },
			{ _count: { _all: items.length } },
			items.map((item) => ({
				id: item.id,
				name: item.name,
				category: item.category,
				createdAt: item.createdAt,
			})),
			[],
		]);

		mockPrisma.item.count.mockResolvedValue(0);

		// Act
		const result = await service.getDashboardOverview(userId);

		// Assert
		result.items.recent.forEach((item, index) => {
			expect(item.createdAt).toBe(toISO((items[index] as any).createdAt));
		});
	});

	it('returns empty results when no items exist', async () => {
		// Arrange
		mockPrisma.$transaction.mockResolvedValue([
			{ onboardingCompleted: true },
			{ _count: { _all: 0 } },
			[],
			[],
		]);

		mockPrisma.item.count.mockResolvedValue(0);

		// Act
		const result = await service.getDashboardOverview(userId);

		// Assert
		expect(result.items.stats.totalItems).toBe(0);
		expect(result.items.recent).toEqual([]);
		expect(result.items.categories).toEqual([]);
	});
});
