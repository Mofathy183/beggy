import type { BagItems, SuitcaseItems } from '@/types';

export enum WeightUnit {
	GRAM = 'GRAM',
	KILOGRAM = 'KILOGRAM',
	POUND = 'POUND',
	OUNCE = 'OUNCE',
}

export enum VolumeUnit {
	ML = 'ML',
	LITER = 'LITER',
	CU_CM = 'CU_CM', // cubic centimeters
	CU_IN = 'CU_IN', // cubic inches
}

export type ConvertToKilogram = Record<WeightUnit, number>;
export type ConvertToLiter = Record<VolumeUnit, number>;

export enum ContainerStatus {
	OK = 'ok',
	FULL = 'full',
	EMPTY = 'empty',
	OVERWEIGHT = 'overweight',
	OVER_CAPACITY = 'over_capacity',
}

export type ItemsType = (BagItems | SuitcaseItems)[];
