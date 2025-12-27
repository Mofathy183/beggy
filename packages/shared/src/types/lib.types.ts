import type { BagItems, SuitcaseItems, WeightUnit, VolumeUnit } from '@/types';

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
