import type { WeightUnit, VolumeUnit } from '@beggy/shared/constants';
import {
	buildContainerMetrics,
	buildContainerState,
} from '@beggy/shared/containers';
import type {
	ContainerItem,
	ContainerStatusDTO,
	ContainerSummaryDTO,
	MoveResultDTO,
} from '@beggy/shared/types';

import type { Container, ContainerItems, Item } from '@prisma-generated/client';

/**
 * Prisma container entity enriched with its related items.
 */
export type ContainerWithItems = Container & {
	containerItems: (ContainerItems & { item: Item })[];
};

/**
 * Maps persistence models into container-related DTOs.
 *
 * @remarks
 * This mapper is responsible for:
 * - Normalizing database entities into domain-friendly structures
 * - Delegating metric/state calculations to shared domain utilities
 * - Producing API-safe DTOs
 */
export const ContainerMapper = {
	/**
	 * Builds a full container status including computed metrics and state.
	 *
	 * @param container - Container with its items from persistence layer
	 * @returns Aggregated container status
	 *
	 * @remarks
	 * Assumes item units stored in the database are compatible with domain enums.
	 */
	toContainerStatus(container: ContainerWithItems): ContainerStatusDTO {
		const items: ContainerItem[] = container.containerItems.map((ci) => ({
			quantity: ci.quantity,
			item: {
				weight: ci.item.weight,
				weightUnit: ci.item.weightUnit as WeightUnit,
				volume: ci.item.volume,
				volumeUnit: ci.item.volumeUnit as VolumeUnit,
			},
		}));

		const metrics = buildContainerMetrics({
			items,
			containerWeight: container.emptyWeight,
			maxWeight: container.maxWeight,
			maxCapacity: container.maxCapacity,
		});

		const state = buildContainerState(metrics, {
			maxWeight: container.maxWeight,
			maxCapacity: container.maxCapacity,
		});

		return { metrics, state };
	},

	/**
	 * Produces a lightweight container summary used after mutations.
	 *
	 * @param container - Updated container entity
	 * @returns Container identifier with its computed status
	 */
	toPackResult(container: ContainerWithItems): ContainerSummaryDTO {
		const status: ContainerStatusDTO = this.toContainerStatus(container);

		return { containerId: container.id, status };
	},

	/**
	 * Maps the result of a move operation affecting two containers.
	 *
	 * @param from - Source container after the move
	 * @param to - Destination container after the move
	 * @returns Combined move result DTO
	 */
	toMoveResult(
		from: ContainerWithItems,
		to: ContainerWithItems
	): MoveResultDTO {
		return {
			from: this.toPackResult(from),
			to: this.toPackResult(to),
		};
	},
};
