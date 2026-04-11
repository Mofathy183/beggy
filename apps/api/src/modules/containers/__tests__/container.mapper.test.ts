import { describe, it, expect } from 'vitest';

import {
	buildContainer,
	buildContainerItems,
} from './factories/container.factory';

import { ContainerMapper } from '../container.mapper';

describe('ContainerMapper', () => {
	describe('toContainerStatus', () => {
		it('returns metrics and state for empty container', () => {
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
			expect(result).toBeDefined();

			expect(result.metrics).toBeDefined();
			expect(result.state).toBeDefined();
		});

		it('returns metrics and state for container with items', () => {
			// Arrange
			const userId = 'user-1';

			const containerItems = buildContainerItems(3, userId);

			const container = buildContainer(userId, {}, { containerItems });

			// Act
			const result = ContainerMapper.toContainerStatus(container);

			// Assert
			expect(result.metrics).toBeDefined();
			expect(result.state).toBeDefined();
		});

		it('maps container items into domain input correctly', () => {
			// Arrange
			const userId = 'user-1';

			const containerItems = buildContainerItems(1, userId, {
				quantity: 2,
			});

			const container = buildContainer(userId, {}, { containerItems });

			// Act
			const result = ContainerMapper.toContainerStatus(container);

			// Assert
			expect(result.metrics.itemCount).toBeGreaterThan(0);

			expect(result.metrics.currentWeight).toBeGreaterThanOrEqual(
				container.emptyWeight
			);
		});
	});

	describe('toPackResult', () => {
		it('returns container id with status summary', () => {
			// Arrange
			const userId = 'user-1';

			const container = buildContainer(userId);

			// Act
			const result = ContainerMapper.toPackResult(container);

			// Assert
			expect(result.containerId).toBe(container.id);

			expect(result.status).toBeDefined();
			expect(result.status.metrics).toBeDefined();
			expect(result.status.state).toBeDefined();
		});
	});

	describe('toMoveResult', () => {
		it('returns results for both source and destination containers', () => {
			// Arrange
			const userId = 'user-1';

			const from = buildContainer(
				userId,
				{},
				{
					containerItems: buildContainerItems(2, userId),
				}
			);

			const to = buildContainer(
				userId,
				{},
				{
					containerItems: buildContainerItems(1, userId),
				}
			);

			// Act
			const result = ContainerMapper.toMoveResult(from, to);

			// Assert
			expect(result.from.containerId).toBe(from.id);
			expect(result.to.containerId).toBe(to.id);

			expect(result.from.status).toBeDefined();
			expect(result.to.status).toBeDefined();
		});

		it('maps each container independently', () => {
			// Arrange
			const userId = 'user-1';

			const from = buildContainer(
				userId,
				{},
				{
					containerItems: buildContainerItems(3, userId),
				}
			);

			const to = buildContainer(
				userId,
				{},
				{
					containerItems: buildContainerItems(1, userId),
				}
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
