/**
 * API Response Types for Items
 */
import { User, SuitcaseItems, BagItems } from '@/types';

export type ItemCategory =
	| 'ELECTRONICS'
	| 'ACCESSORIES'
	| 'FURNITURE'
	| 'MEDICINE'
	| 'CLOTHING'
	| 'BOOKS'
	| 'FOOD';

export type VolumeUnit = 'ML' | 'LITER' | 'CU_CM' | 'CU_IN';
export type WeightUnit = 'GRAM' | 'KILOGRAM' | 'POUND' | 'OUNCE';

export interface Item {
	id: string;
	name: string;
	category: ItemCategory;
	quantity: number;
	weight: number;
	weightUnit: WeightUnit;
	volume: number;
	volumeUnit: VolumeUnit;
	color?: string | null;
	isFragile: boolean;
	createdAt: Date;
	updatedAt: Date;
	userId?: string | null;
}

export interface ItemWithRelations extends Item {
	bagItems: BagItems;
	suitcaseItems: SuitcaseItems;
	user?: User;
}
