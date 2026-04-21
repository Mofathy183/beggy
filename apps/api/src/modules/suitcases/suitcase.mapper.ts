import type {
	Suitcase,
	Container,
	ContainerItems,
	Item,
} from '@prisma-generated/client';

import type {
	SuitcaseType,
	SuitcaseFeature,
	WheelType,
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
	SuitcaseDTO,
	ContainerStatusDTO,
	ContainerItem,
} from '@beggy/shared/types';

import { toISO } from '@shared/utils';

/**
 * Prisma suitcase entity with its associated container aggregate.
 *
 * @remarks
 * Required shape for mapping suitcase data including container items and metrics.
 */
export type SuitcaseWithContainer = Suitcase & {
	container: Container & {
		containerItems: (ContainerItems & {
			item: Item;
		})[];
	};
};

/**
 * Maps Suitcase persistence entities into API DTOs.
 *
 * @remarks
 * - Normalizes nested container items into domain-compatible structures
 * - Delegates metric and state computation to shared domain utilities
 * - Produces a transport-safe representation for API responses
 */
export const SuitcaseMapper = {
	/**
	 * Converts a single suitcase aggregate into a DTO.
	 *
	 * @param suitcase - Fully hydrated suitcase entity
	 * @returns Suitcase DTO including computed container status
	 *
	 * @remarks
	 * Assumes persisted enum values are valid domain values.
	 * Invalid enum values may propagate incorrect state.
	 */
	toDTO(suitcase: SuitcaseWithContainer): SuitcaseDTO {
		const { container } = suitcase;

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

		const metrics = buildContainerMetrics({
			items: containerItems,
			containerWeight: container.emptyWeight,
			maxWeight: container.maxWeight,
			maxCapacity: container.maxCapacity,
		});

		const state = buildContainerState(metrics, {
			maxWeight: container.maxWeight,
			maxCapacity: container.maxCapacity,
		});

		const status: ContainerStatusDTO = { metrics, state };

		return {
			id: suitcase.id,
			name: suitcase.name,
			brand: suitcase.brand ?? null,
			type: suitcase.type as SuitcaseType,
			containerId: suitcase.containerId,
			color: suitcase.color,
			size: suitcase.size as Size,

			maxCapacity: container.maxCapacity,
			maxWeight: container.maxWeight,
			emptyWeight: container.emptyWeight,

			material: suitcase.material as Material | null,
			features: suitcase.features as SuitcaseFeature[],
			wheels: suitcase.wheels as WheelType | null,

			status,

			createdAt: toISO(suitcase.createdAt),
			updatedAt: toISO(suitcase.updatedAt),
			userId: suitcase.userId,
		};
	},

	/**
	 * Converts a list of suitcase aggregates into DTOs.
	 *
	 * @param suitcases - Array of hydrated suitcase entities
	 * @returns Array of suitcase DTOs
	 */
	toDTOList(suitcases: SuitcaseWithContainer[]): SuitcaseDTO[] {
		return suitcases.map(SuitcaseMapper.toDTO);
	},
};
