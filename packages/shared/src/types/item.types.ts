/**
 * API Response Types for Items
 */
import { User, SuitcaseItems, BagItems } from '@/types';

export enum ItemCategory {
	ELECTRONICS = 'ELECTRONICS',
	ACCESSORIES = 'ACCESSORIES',
	FURNITURE = 'FURNITURE',
	MEDICINE = 'MEDICINE',
	CLOTHING = 'CLOTHING',
	BOOKS = 'BOOKS',
	FOOD = 'FOOD',
}

export enum VolumeUnit {
	ML = 'ML',
	LITER = 'LITER',
	CU_CM = 'CU_CM', // cubic centimeters
	CU_IN = 'CU_IN', // cubic inches
}

export enum WeightUnit {
	GRAM = 'GRAM',
	KILOGRAM = 'KILOGRAM',
	POUND = 'POUND',
	OUNCE = 'OUNCE',
}

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
	bagItems: BagItems[];
	suitcaseItems: SuitcaseItems[];
	user?: User | null;
}
