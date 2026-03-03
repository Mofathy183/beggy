import type { Item } from '@prisma-generated/client';
import type {
	ItemCategory,
	WeightUnit,
	VolumeUnit,
} from '@beggy/shared/constants';
import type { ItemDTO } from '@beggy/shared/types';
import { toISO } from '@shared/utils';

/**
 * Maps persistence-layer Item entities to transport-safe DTOs.
 *
 * @description
 * Acts as an anti-corruption layer between Prisma models and
 * external-facing DTO contracts.
 *
 * @remarks
 * - Converts Date objects to ISO strings.
 * - Assumes enum values between Prisma schema and shared constants are aligned.
 * - Pure and side-effect free.
 */
export const ItemMapper = {
	/**
	 * Converts a single Prisma Item entity into an ItemDTO.
	 *
	 * @param item - Persistence-layer Item model.
	 * @returns Transport-ready ItemDTO.
	 *
	 * @remarks
	 * Enum fields are cast to shared constants. If schema and shared enums
	 * diverge, runtime inconsistencies may occur.
	 */
	toDTO(item: Item): ItemDTO {
		return {
			id: item.id,
			name: item.name,
			category: item.category as ItemCategory,
			weight: item.weight,
			weightUnit: item.weightUnit as WeightUnit,
			volume: item.volume,
			volumeUnit: item.volumeUnit as VolumeUnit,
			color: item.color,
			isFragile: item.isFragile,
			createdAt: toISO(item.createdAt),
			updatedAt: toISO(item.updatedAt),
			userId: item.userId,
		};
	},

	/**
	 * Converts a collection of Item entities into DTOs.
	 *
	 * @param items - Array of persistence-layer Items.
	 * @returns Array of ItemDTOs.
	 */
	toDTOList(items: Item[]): ItemDTO[] {
		return items.map(ItemMapper.toDTO);
	},
};
