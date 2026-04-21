import { describe, it, expect } from 'vitest';

import {
	buildContainer,
	buildContainerItems,
} from './factories/container.factory';

import { ContainerMapper } from '../container.mapper';

describe('ContainerMapper', () => {
	describe('toContainerStatus()', () => {
		it('returns zeroed metrics for an empty container', () => {
			// Arrange
			const userId = 'user-1';

			const container = buildContainer(
				userId,
				{},
				{ containerItems: [] }
			);

			// Act
			const result = ContainerMapper.toContainerStatus(container);

			// Assert
			expect(result.metrics.itemCount).toBe(0);
			expect(result.metrics.currentWeight).toBe(container.emptyWeight);
			expect(result.state).toBeDefined();
		});

		it('calculates metrics from container items', () => {
			// Arrange
			const userId = 'user-1';

			const containerItems = buildContainerItems(2, userId, {
				quantity: 2,
			});

			const container = buildContainer(userId, {}, { containerItems });

			// Act
			const result = ContainerMapper.toContainerStatus(container);

			// Assert
			expect(result.metrics.itemCount).toBeGreaterThan(0);

			expect(result.metrics.currentWeight).toBeGreaterThan(
				container.emptyWeight
			);
		});

		it('maps item quantities into metrics correctly', () => {
			// Arrange
			const userId = 'user-1';

			const containerItems = buildContainerItems(1, userId, {
				quantity: 3,
			});

			const container = buildContainer(userId, {}, { containerItems });

			// Act
			const result = ContainerMapper.toContainerStatus(container);

			// Assert
			expect(result.metrics.itemCount).toBe(3);
		});
	});

	describe('toContainerState()', () => {
		it('returns container state with packed items', () => {
			// Arrange
			const userId = 'user-1';

			const containerItems = buildContainerItems(2, userId);

			const container = buildContainer(userId, {}, { containerItems });

			// Act
			const result = ContainerMapper.toContainerState(container);

			// Assert
			expect(result.containerId).toBe(container.id);
			expect(result.items).toHaveLength(2);

			expect(result.status).toBeDefined();
			expect(result.status.metrics).toBeDefined();
		});

		it('maps item fields correctly', () => {
			// Arrange
			const userId = 'user-1';

			const ci = buildContainerItems(1, userId);

			const container = buildContainer(
				userId,
				{},
				{
					containerItems: ci,
				}
			);

			// Act
			const result = ContainerMapper.toContainerState(container);

			// Assert
			const mapped = result.items[0];

			expect(mapped?.itemId).toBe(ci[0]?.item.id);
			expect(mapped?.name).toBe(ci[0]?.item.name);
			expect(mapped?.quantity).toBe(ci[0]?.quantity);
			expect(mapped?.weight).toBe(ci[0]?.item.weight);
			expect(mapped?.volume).toBe(ci[0]?.item.volume);
		});
	});

	describe('toPackResult()', () => {
		it('returns container id with computed status', () => {
			// Arrange
			const userId = 'user-1';

			const container = buildContainer(userId);

			// Act
			const result = ContainerMapper.toPackResult(container);

			// Assert
			expect(result.containerId).toBe(container.id);
			expect(result.status.metrics).toBeDefined();
			expect(result.status.state).toBeDefined();
		});
	});

	describe('toMoveResult()', () => {
		it('returns mapped results for both containers', () => {
			// Arrange
			const userId = 'user-1';

			const from = buildContainer(
				userId,
				{},
				{ containerItems: buildContainerItems(2, userId) }
			);

			const to = buildContainer(
				userId,
				{},
				{ containerItems: buildContainerItems(1, userId) }
			);

			// Act
			const result = ContainerMapper.toMoveResult(from, to);

			// Assert
			expect(result.from.containerId).toBe(from.id);
			expect(result.to.containerId).toBe(to.id);
		});

		it('maps containers independently', () => {
			// Arrange
			const userId = 'user-1';

			const from = buildContainer(
				userId,
				{},
				{ containerItems: buildContainerItems(3, userId) }
			);

			const to = buildContainer(
				userId,
				{},
				{ containerItems: buildContainerItems(1, userId) }
			);

			// Act
			const result = ContainerMapper.toMoveResult(from, to);

			// Assert
			expect(result.from.status.metrics).not.toEqual(
				result.to.status.metrics
			);
		});
	});
});
