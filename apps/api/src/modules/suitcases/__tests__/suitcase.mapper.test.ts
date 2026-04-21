import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SuitcaseMapper } from '../suitcase.mapper';

import { buildSuitcase } from './factories/suitcase.factory';
import { buildContainerItems } from '@modules/containers/__tests__/factories/container.factory';

// 🔌 Mock external dependencies
vi.mock('@beggy/shared/containers', () => ({
	buildContainerMetrics: vi.fn(),
	buildContainerState: vi.fn(),
}));

vi.mock('@shared/utils', () => ({
	toISO: vi.fn(),
}));

import {
	buildContainerMetrics,
	buildContainerState,
} from '@beggy/shared/containers';

import { toISO } from '@shared/utils';

describe('SuitcaseMapper', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('toDTO', () => {
		it('returns mapped dto', () => {
			// Arrange
			const userId = 'user-1';

			const suitcase = buildSuitcase(userId);

			const mockMetrics = { totalWeight: 10 };
			const mockState = { isOverweight: false };

			(buildContainerMetrics as any).mockReturnValue(mockMetrics);
			(buildContainerState as any).mockReturnValue(mockState);

			(toISO as any)
				.mockReturnValueOnce('created-iso')
				.mockReturnValueOnce('updated-iso');

			// Act
			const result = SuitcaseMapper.toDTO(suitcase);

			// Assert
			expect(result).toEqual(
				expect.objectContaining({
					id: suitcase.id,
					name: suitcase.name,
					containerId: suitcase.containerId,
					userId: suitcase.userId,

					maxCapacity: suitcase.container.maxCapacity,
					maxWeight: suitcase.container.maxWeight,
					emptyWeight: suitcase.container.emptyWeight,

					status: {
						metrics: mockMetrics,
						state: mockState,
					},

					createdAt: 'created-iso',
					updatedAt: 'updated-iso',
				})
			);
		});

		it('maps container items', () => {
			// Arrange
			const userId = 'user-1';

			const items = buildContainerItems(2, userId);

			const suitcase = buildSuitcase(
				userId,
				{},
				{},
				{ containerItems: items }
			);

			(buildContainerMetrics as any).mockReturnValue({});
			(buildContainerState as any).mockReturnValue({});
			(toISO as any).mockReturnValue('iso');

			// Act
			SuitcaseMapper.toDTO(suitcase);

			// Assert
			expect(buildContainerMetrics).toHaveBeenCalledWith(
				expect.objectContaining({
					items: expect.arrayContaining([
						expect.objectContaining({
							quantity: items[0]?.quantity,
							item: expect.objectContaining({
								weight: items[0]?.item.weight,
								volume: items[0]?.item.volume,
							}),
						}),
					]),
				})
			);
		});

		it('calls metrics and state builders with correct args', () => {
			// Arrange
			const userId = 'user-1';

			const suitcase = buildSuitcase(userId);

			(buildContainerMetrics as any).mockReturnValue({});
			(buildContainerState as any).mockReturnValue({});
			(toISO as any).mockReturnValue('iso');

			// Act
			SuitcaseMapper.toDTO(suitcase);

			// Assert
			expect(buildContainerMetrics).toHaveBeenCalledWith(
				expect.objectContaining({
					containerWeight: suitcase.container.emptyWeight,
					maxWeight: suitcase.container.maxWeight,
					maxCapacity: suitcase.container.maxCapacity,
				})
			);

			expect(buildContainerState).toHaveBeenCalledWith(
				expect.anything(),
				expect.objectContaining({
					maxWeight: suitcase.container.maxWeight,
					maxCapacity: suitcase.container.maxCapacity,
				})
			);
		});

		it('preserves nullables', () => {
			// Arrange
			const userId = 'user-1';

			const suitcase = buildSuitcase(userId, {
				brand: null,
				material: null,
				wheels: null,
			});

			(buildContainerMetrics as any).mockReturnValue({});
			(buildContainerState as any).mockReturnValue({});
			(toISO as any).mockReturnValue('iso');

			// Act
			const result = SuitcaseMapper.toDTO(suitcase);

			// Assert
			expect(result.brand).toBeNull();
			expect(result.material).toBeNull();
			expect(result.wheels).toBeNull();
		});
	});

	describe('toDTOList', () => {
		it('returns dto list', () => {
			// Arrange
			const userId = 'user-1';

			const suitcases = [buildSuitcase(userId), buildSuitcase(userId)];

			(buildContainerMetrics as any).mockReturnValue({});
			(buildContainerState as any).mockReturnValue({});
			(toISO as any).mockReturnValue('iso');

			// Act
			const result = SuitcaseMapper.toDTOList(suitcases);

			// Assert
			expect(result).toHaveLength(2);

			expect(result[0]).toHaveProperty('id');
			expect(result[1]).toHaveProperty('id');
		});
	});
});
