/**
 * API Response Types for Suitcases
 */

import { User, Item } from '@/types';

export type SuitcaseType =
	| 'CARRY_ON'
	| 'CHECKED_LUGGAGE'
	| 'HARD_SHELL'
	| 'SOFT_SHELL'
	| 'BUSINESS'
	| 'KIDS'
	| 'EXPANDABLE';

export type SuitcaseFeature =
	| 'NONE'
	| 'TSA_LOCK'
	| 'WATERPROOF'
	| 'EXPANDABLE'
	| 'USB_PORT'
	| 'LIGHTWEIGHT'
	| 'ANTI_THEFT'
	| 'SCRATCH_RESISTANT'
	| 'COMPRESSION_STRAPS'
	| 'TELESCOPIC_HANDLE';

export type WheelType = 'NONE' | 'TWO_WHEEL' | 'FOUR_WHEEL' | 'SPINNER';

export type Size = 'SMALL' | 'MEDIUM' | 'LARGE' | 'EXTRA_LARGE';

export type Material =
	| 'LEATHER'
	| 'SYNTHETIC'
	| 'FABRIC'
	| 'POLYESTER'
	| 'NYLON'
	| 'CANVAS'
	| 'HARD_SHELL'
	| 'METAL';

export interface Suitcase {
	id: string;
	name: string;
	brand: string | null;
	type: SuitcaseType;
	color: string | null;
	size: Size;
	maxCapacity: number;
	maxWeight: number;
	suitcaseWeight: number;
	material: Material | null;
	features: SuitcaseFeature[];
	wheels: WheelType | null;
	createdAt: Date;
	updatedAt: Date;
	userId: string | null;
}

export interface SuitcaseItems {
	suitcaseId: string;
	itemId: string;
	item: Item;
	suitcase: Suitcase;
	createdAt: Date;
	updatedAt: Date;
}

export interface SuitcaseWithRelations extends Suitcase {
	suitcaseItems: SuitcaseItems[];
	user: User;
}
