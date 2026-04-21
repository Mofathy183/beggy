import type {
	WeightUnit,
	VolumeUnit,
	ItemCategory,
	ContainerType,
} from '@beggy/shared/constants';
import {
	buildContainerMetrics,
	buildContainerState,
} from '@beggy/shared/containers';
import type {
	ContainerItem,
	ContainerStatusDTO,
	ContainerStateDTO,
	ContainerSummaryDTO,
	PackedItemDTO,
	MoveResultDTO,
} from '@beggy/shared/types';

import type { Container, ContainerItems, Item } from '@prisma-generated/client';

/**
 * Prisma container entity enriched with its related items.
 *
 * @remarks
 * Represents the persistence shape required for all container mapping operations.
 */
export type ContainerWithItems = Container & {
	containerItems: (ContainerItems & { item: Item })[];
};

/**
 * Maps persistence models into container-related DTOs.
 *
 * @remarks
 * - Normalizes Prisma entities into domain-compatible structures
 * - Delegates all metric/state computation to shared domain utilities
 * - Produces API-safe DTOs consumed by controllers
 *
 * @see buildContainerMetrics
 * @see buildContainerState
 */
export const ContainerMapper = {
	/**
	 * Builds computed container status (metrics + state).
	 *
	 * @param container - Container entity with loaded items
	 * @returns Computed container status
	 *
	 * @remarks
	 * Assumes stored unit values are valid members of domain enums.
	 * Invalid values may result in incorrect calculations downstream.
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
	 * Builds full container state including packed items and computed status.
	 *
	 * @param container - Container entity with loaded items
	 * @returns Full container state DTO
	 *
	 * @remarks
	 * Used for detailed container views where both raw items and derived state are required.
	 */
	toContainerState(container: ContainerWithItems): ContainerStateDTO {
		const packedItems: PackedItemDTO[] = container.containerItems.map(
			(ci) => ({
				itemId: ci.item.id,
				name: ci.item.name,
				quantity: ci.quantity,
				weight: ci.item.weight,
				weightUnit: ci.item.weightUnit as WeightUnit,
				volume: ci.item.volume,
				volumeUnit: ci.item.volumeUnit as VolumeUnit,
				category: ci.item.category as ItemCategory,
				isFragile: ci.item.isFragile,
				color: ci.item.color ?? null,
			})
		);

		return {
			containerId: container.id,
			type: container.type as ContainerType,
			items: packedItems,
			status: this.toContainerStatus(container),
		};
	},

	/**
	 * Produces a lightweight container summary after mutation operations.
	 *
	 * @param container - Updated container entity
	 * @returns Container identifier with computed status
	 */
	toPackResult(container: ContainerWithItems): ContainerSummaryDTO {
		const status = this.toContainerStatus(container);

		return { containerId: container.id, status };
	},

	/**
	 * Maps the result of a move operation affecting two containers.
	 *
	 * @param from - Source container after move
	 * @param to - Destination container after move
	 * @returns Combined move result DTO
	 *
	 * @remarks
	 * Ensures both containers are normalized using the same mapping logic.
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
