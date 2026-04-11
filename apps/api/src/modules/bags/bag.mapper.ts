import type {
	Bag,
	Container,
	ContainerItems,
	Item,
} from '@prisma-generated/client';
import type {
	BagType,
	BagFeature,
	Size,
	Material,
	WeightUnit,
	VolumeUnit,
} from '@beggy/shared/constants';
import {
	buildContainerMetrics,
	buildContainerState,
} from '@beggy/shared/containers';
import type {
	BagDTO,
	ContainerStatusDTO,
	ContainerItem,
} from '@beggy/shared/types';
import { toISO } from '@shared/utils';

/**
 * Prisma bag shape with fully hydrated container and items.
 *
 * @remarks
 * Must align with the `include` clause in the corresponding Prisma query.
 * Any mismatch (e.g. missing `item`) will break metric calculations at runtime.
 */
export type BagWithContainer = Bag & {
	container: Container & {
		containerItems: (ContainerItems & {
			item: Item;
		})[];
	};
};

/**
 * Maps persistence-layer Bag entities into transport-safe DTOs.
 *
 * @description
 * Acts as an anti-corruption layer between Prisma models and external contracts.
 * Enriches the response with derived container status (metrics + state).
 *
 * @remarks
 * - Pure and side-effect free.
 * - Assumes valid enum values coming from the database.
 * - Date fields are normalized to ISO strings.
 */
export const BagMapper = {
	/**
	 * Converts a Prisma Bag (with container + items) into a {@link BagDTO}.
	 *
	 * @param bag - Bag entity with required relational data preloaded
	 * @returns DTO enriched with computed container status
	 *
	 * @throws If required relational data is missing (e.g. container or item)
	 */
	toDTO(bag: BagWithContainer): BagDTO {
		const { container } = bag;

		// Normalize persistence shape into calculation-friendly structure
		const containerItems: ContainerItem[] = container.containerItems.map(
			(ci) => ({
				quantity: ci.quantity,
				item: {
					weight: ci.item.weight,
					weightUnit: ci.item.weightUnit as WeightUnit,
					volume: ci.item.volume,
					volumeUnit: ci.item.volumeUnit as VolumeUnit,
				},
			})
		);

		// Compute aggregate metrics based on items + container constraints
		const metrics = buildContainerMetrics({
			items: containerItems,
			containerWeight: container.emptyWeight,
			maxWeight: container.maxWeight,
			maxCapacity: container.maxCapacity,
		});

		// Derive container state from computed metrics
		const state = buildContainerState(metrics, {
			maxWeight: container.maxWeight,
			maxCapacity: container.maxCapacity,
		});

		const status: ContainerStatusDTO = { metrics, state };

		return {
			id: bag.id,
			containerId: bag.containerId,
			name: bag.name,
			type: bag.type as BagType,
			color: bag.color,
			size: bag.size as Size,
			maxCapacity: container.maxCapacity,
			maxWeight: container.maxWeight,
			emptyWeight: container.emptyWeight,
			material: bag.material as Material | null,
			features: bag.features as BagFeature[],
			status,
			createdAt: toISO(bag.createdAt),
			updatedAt: toISO(bag.updatedAt),
			userId: bag.userId,
		};
	},

	/**
	 * Converts multiple Bag entities into DTOs.
	 *
	 * @param bags - Collection of hydrated Bag entities
	 * @returns DTO list preserving input order
	 */
	toDTOList(bags: BagWithContainer[]): BagDTO[] {
		return bags.map(BagMapper.toDTO);
	},
};
